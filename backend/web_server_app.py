from threading import Thread
from typing import Optional
import os

from flask import Flask, request, jsonify, send_from_directory, send_file, Response
from flask_cors import CORS 
import json
import base64
from PIL import Image, ExifTags
from io import BytesIO
import zipfile
import io

DIRECTORY = os.path.join(os.path.dirname(__file__), "dist/hello-world-app")

server = "stopped"

flask_thread: Optional[Thread] = None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

storage_data = {"uri": None}

BASE_PATH = "/home/eduardo_araujo/Documentos/project/downloads/AssayCollections"

def set_storage_uri(uri):    
    storage_data["uri"] = uri

def get_base_path():
    if storage_data["uri"] is not None:
        return storage_data["uri"] + "/AssayCollections"
    else:
        return BASE_PATH
    return None
    
def get_enssay_collections():
    results = []
    for folder_name in os.listdir(get_base_path()):
        folder_path = os.path.join(get_base_path(), folder_name)
        data_json_path = os.path.join(folder_path, "Data.json")

        if os.path.isdir(folder_path) and os.path.exists(data_json_path):
            try:
                with open(data_json_path, "r", encoding="utf-8") as json_file:
                    data = json.load(json_file)

                name = data.get("name", "")
                description = data.get("description", "")

                results.append({
                    "nameFolder": folder_name,
                    "name": name,
                    "description": description,
                })

            except Exception as e:
                print(f"Erro ao processar {data_json_path}: {e}")

    return results

def update_enssay_collections(folder_name):
    payload = request.get_json() or {}
    new_name = payload.get("name")
    new_description = payload.get("description")

    if new_name is None or new_description is None:
        return jsonify({"error": "É necessário enviar 'name' e 'description' no corpo da requisição"}), 400

    base = get_base_path()
    folder_path = os.path.join(base, folder_name)
    data_json_path = os.path.join(folder_path, "Data.json")

    if not os.path.isdir(folder_path):
        return jsonify({"error": f"Pasta '{folder_name}' não encontrada"}), 404

    if not os.path.exists(data_json_path):
        return jsonify({"error": f"Arquivo Data.json não existe em '{folder_name}'"}), 404

    try:
        with open(data_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return jsonify({"error": f"Falha ao ler {data_json_path}: {e}"}), 500

    data["name"] = new_name
    data["description"] = new_description

    try:
        with open(data_json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify({"error": f"Falha ao salvar {data_json_path}: {e}"}), 500

    result = {
        "nameFolder": folder_name,
        "name":     data["name"],
        "description": data["description"]
    }
    return result

def get_captures_taken(folder_name):
    folder_path = os.path.join(get_base_path(), folder_name)
    result = []

    if os.path.isdir(folder_path):
        for subfolder in os.listdir(folder_path):
            subfolder_path = os.path.join(folder_path, subfolder)
            if os.path.isdir(subfolder_path):
                inner_folders = [f for f in os.listdir(subfolder_path) if os.path.isdir(os.path.join(subfolder_path, f))]
                if inner_folders:
                    result.append({
                        "folder": subfolder,
                        "subfolder": inner_folders[0]
                    })

    return result

def find_and_parse_folders(start_path, use_training):
    result = []
    selected_dir = "Calibration" if use_training else "Analysis"

    for root, dirs, files in os.walk(start_path):
        if selected_dir in dirs:
            target_path = os.path.join(root, selected_dir)

            for filename in os.listdir(target_path):
                if filename.endswith(".json"):
                    json_path = os.path.join(target_path, filename)
                    with open(json_path, "r", encoding="utf-8") as f:
                        data = json.load(f)

                    fileName = data.get("fileName")
                    image_path2 = os.path.join(target_path, fileName)

                    main_image_base64 = compress_and_resize_image(image_path2)

                    obj = {
                        "analystName": data.get("analystName"),
                        "referenceFileName": data.get("referenceFileName"),
                        "stockName": data["readingMedium"].get("source").get("aliquot").get("stock").get("name"),
                        "aliquotName": data["readingMedium"].get("source").get("aliquot").get("name"),
                        "standardVolume": data.get("extraValues").get("StandardVolume"),
                        "usedVolume": data.get("extraValues").get("UsedVolume"),
                        "datetime": data.get("datetime"),
                        #"assaysCollection": data["key"].get("assaysCollection"),
                        "analyte": data["key"].get("analyte"),
                        "analyticalParameter": data["key"].get("analyticalParameter"),
                        "captureTechnique": data["key"].get("captureTechnique"),
                        "sample": data["key"].get("sample"),
                        "extraFileNames": [],
                        "fileName": main_image_base64
                    }

                    base_name = os.path.splitext(fileName)[0] + "-"
                    for image_name in data.get("extraFileNames", []):
                        if image_name.startswith(base_name):
                            image_path = os.path.join(target_path, image_name)
                            if os.path.exists(image_path):
                                encoded_string = compress_and_resize_image(image_path)
                                obj["extraFileNames"].append({
                                    "namePath": image_name,
                                    "base64": encoded_string
                                })                    
                    result.append(obj)

    return result

@app.route('/download', methods=['GET'])
def download_directory():
    path_default = get_base_path()
    directory_path_param = request.args.get('directoryPath')

    if not directory_path_param:
        return "Missing 'directoryPath' query parameter", 400

    directory_path = os.path.join(path_default, directory_path_param)

    if not os.path.exists(directory_path) or not os.path.isdir(directory_path):
        return "Directory not found", 404

    zip_filename = f"{os.path.basename(directory_path)}.zip"

    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, directory_path)
                zipf.write(full_path, arcname)

    memory_file.seek(0)

    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name=zip_filename
    )

@app.route("/enssay-collections", methods=["GET"])
def get_enssay_collections_endpoint():
    data = get_enssay_collections()
    return jsonify(data)

@app.route("/enssay-collections/<folder_name>", methods=["PUT"])
def update_enssay_collection_endpoint(folder_name):
    data = update_enssay_collections(folder_name)
    return jsonify(data)

@app.route("/captures-taken", methods=["GET"])
def get_captures_taken_endpoint():
    folder_name = request.args.get("folder_name")
    if not folder_name:
        return jsonify({"error": "Parâmetro folder_name é obrigatório"}), 400
    data = get_captures_taken(folder_name)
    return jsonify(data)

@app.route("/parse-jsons", methods=["GET"])
def parse_jsons_endpoint():
    path = request.args.get("path")
    use_training = request.args.get("use_training", "false").lower() == "true"
    
    if not path:
        return jsonify({"error": "Parâmetro 'path' é obrigatório"}), 400

    full_path = os.path.join(get_base_path(), path)
    try:
        result = find_and_parse_folders(full_path, use_training)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_angular(path):
    if path != "" and os.path.exists(os.path.join(DIRECTORY, path)):
        return send_from_directory(DIRECTORY, path)
    else:
        return send_from_directory(DIRECTORY, "index.html")

@app.route("/uri", methods=["GET"])
def get_uri():
    if storage_data["uri"] is None:
        return "Nenhum Storage URI definido", 404
    return storage_data["uri"]

@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({"server": server})

@app.route("/shutdown", methods=["GET"])
def shutdown():
    func = request.environ.get("werkzeug.server.shutdown")
    if func is None:
        raise RuntimeError("Não está rodando com o servidor Werkzeug")
    func()
    return "Servidor encerrado"

def compress_and_resize_image(image_path, max_size=(500, 500), quality=50):
    """ Reduz o tamanho e a qualidade da imagem antes de converter para base64 e corrige orientação """
    try:
        with Image.open(image_path) as img:
            try:
                exif = img._getexif()
                if exif is not None:
                    for orientation in ExifTags.TAGS.keys():
                        if ExifTags.TAGS[orientation] == 'Orientation':
                            break
                    orientation_value = exif.get(orientation, None)
                    if orientation_value == 3:
                        img = img.rotate(180, expand=True)
                    elif orientation_value == 6:
                        img = img.rotate(270, expand=True)
                    elif orientation_value == 8:
                        img = img.rotate(90, expand=True)
            except Exception as e:
                pass

            img.thumbnail(max_size)
            img = img.convert("RGB")
            
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=quality)
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Erro ao processar imagem {image_path}: {e}")
        return None

# MUDAR PARA 4200 AO SUBIR
def get_port() -> int:
    return 3000

def is_running() -> bool:
    return flask_thread is not None and flask_thread.is_alive()

def run_flask():
    app.run(host="0.0.0.0", port=get_port(), debug=False, use_reloader=False)

def start() -> None:
    global flask_thread

    if not is_running():
        flask_thread = Thread(target=run_flask, daemon=True)
        flask_thread.start()
        server = 'runing';

def stop() -> None:
    global flask_thread, server

    if is_running():
        try:
            requests.get("http://127.0.0.1:4200/shutdown")
        except Exception as e:
            print("Erro ao parar o servidor:", e)

        flask_thread = None
        server = "stopped"

# REMOVER AO SUBIR
if __name__ == "__main__":
    run_flask()