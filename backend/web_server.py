from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from threading import Thread
from typing import Optional
import os

from flask import Flask,request, jsonify
from flask_cors import CORS 
import json
import base64
from PIL import Image
from io import BytesIO

# from android.content import ContentResolver
# from android.net import Uri
#from chaquopy import android
# android_context = None

DIRECTORY = os.path.join(os.path.dirname(__file__), "dist/hello-world-app")

server: Optional[TCPServer] = None

flask_thread: Optional[Thread] = None

app = Flask(__name__)
CORS(app)

storage_data = {"uri": None}

def set_storage_uri(uri):    
    storage_data["uri"] = uri

#storage_uri = storage_data["uri"]
#BASE_PATH = storage_uri+"/AssaysCollection"
#BASE_PATH = "/storage/emulated/0/Documents/AssaysCollection"
#BASE_PATH2 = "/storage/emulated/0/Documents/AssaysCollection/5377547b-ec51-4a11-a66b-5c7bf14a486a"

BASE_PATH = "/home/eduardo_araujo/Documentos/project/downloads/AssaysCollection"
BASE_PATH2 = "/home/eduardo_araujo/Documentos/project/downloads/AssaysCollection/5377547b-ec51-4a11-a66b-5c7bf14a486a"

# --------------------- Backend ------------------

def get_training_dataa():
    results = []
    
    # Percorre todas as pastas dentro de AssaysCollection
    for root, dirs, files in os.walk(BASE_PATH2):
        if "Training" in root:  # Encontrou uma pasta chamada "Training"
            for file in files:
                if file.endswith(".json"):  # Processar apenas arquivos JSON
                    json_path = os.path.join(root, file)

                    try:
                        with open(json_path, "r", encoding="utf-8") as json_file:
                            data = json.load(json_file)

                        sample_id = data["key"]["sample"]
                        analyst_name = data.get("analystName", "")
                        extra_images = []

                        # Lista os arquivos de imagem relacionados ao sample_id
                        for i in range(1, 5):  # Extra1 a Extra4
                            img_name = f"{sample_id}-extra{i}.jpg"
                            img_path = os.path.join(root, img_name)

                            if os.path.exists(img_path):
                                with open(img_path, "rb") as img_file:
                                    img_base64 = base64.b64encode(img_file.read()).decode("utf-8")

                                extra_images.append({
                                    "namePath": img_name,
                                    "base64": img_base64
                                })

                        results.append({
                            "sample": sample_id,
                            "analystName": analyst_name,
                            "extraFileNames": extra_images
                        })

                    except Exception as e:
                        print(f"Erro ao processar {json_path}: {e}")

    return results







def compress_and_resize_image(image_path, max_size=(500, 500), quality=50):
    """ Reduz o tamanho e a qualidade da imagem antes de converter para base64 """
    try:
        with Image.open(image_path) as img:
            img.thumbnail(max_size)  # Redimensiona mantendo proporção
            img = img.convert("RGB")  # Converte para RGB se necessário
            
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=quality)  # Reduz qualidade
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Erro ao processar imagem {image_path}: {e}")
        return None


def get_training_data():
    results = []
    
    for root, dirs, files in os.walk(BASE_PATH2):
        if "Training" in root:
            for file in files:
                if file.endswith(".json"):  
                    json_path = os.path.join(root, file)

                    try:
                        with open(json_path, "r", encoding="utf-8") as json_file:
                            data = json.load(json_file)

                        sample_id = data["key"]["sample"]
                        analyst_name = data.get("analystName", "")
                        extra_images = []

                        for i in range(1, 5):  # Extra1 a Extra4
                            img_name = f"{sample_id}-extra{i}.jpg"
                            img_path = os.path.join(root, img_name)

                            if os.path.exists(img_path):
                                img_base64 = compress_and_resize_image(img_path)

                                if img_base64:
                                    extra_images.append({
                                        "namePath": img_name,
                                        "base64": img_base64
                                    })

                        results.append({
                            "sample": sample_id,
                            "analystName": analyst_name,
                            "extraFileNames": extra_images
                        })

                    except Exception as e:
                        print(f"Erro ao processar {json_path}: {e}")

    return results


@app.route("/api/get-inference-training", methods=["GET"])
def get_inference_training():
    data = get_training_data()
    return jsonify(data) 
    


def get_enssay_collections():
    results = []
    for folder_name in os.listdir(BASE_PATH):
        folder_path = os.path.join(BASE_PATH, folder_name)
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

@app.route("/enssay-collections", methods=["GET"])
def get_enssay_collections_endpoint():
    data = get_enssay_collections()
    return jsonify(data)




# @app.route("/captures-taken/<folder_name>", methods=["GET"])
# def get_captures_taken_endpoint(folder_name):
#     data = get_captures_taken(folder_name)
#     return jsonify(data)

@app.route("/captures-taken", methods=["GET"])
def get_captures_taken_endpoint():
    folder_name = request.args.get("folder_name")
    if not folder_name:
        return jsonify({"error": "Parâmetro folder_name é obrigatório"}), 400
    data = get_captures_taken(folder_name)
    return jsonify(data)

def get_captures_taken(folder_name):
    folder_path = os.path.join(BASE_PATH, folder_name)
    result = []

    if os.path.isdir(folder_path):
        for subfolder in os.listdir(folder_path):
            subfolder_path = os.path.join(folder_path, subfolder)
            if os.path.isdir(subfolder_path):
                # Agora entra em cada subpasta e pega a primeira sub-subpasta
                inner_folders = [f for f in os.listdir(subfolder_path) if os.path.isdir(os.path.join(subfolder_path, f))]
                if inner_folders:
                    result.append(inner_folders[0])  # pega só a primeira encontrada

    return result






@app.route("/uri", methods=["GET"])
def get_uri():
    if storage_data["uri"] is None:
        return "Nenhum Storage URI definido", 404
    return storage_data["uri"]

@app.route("/teste", methods=["GET"])
def teste():
    return "Hello world"



# -------------------- Frontend ----------------------

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def get_port() -> int:
    return 4200

def get_api_port():
    return 3000 

def is_running() -> bool:
    return server != None

def run_flask():
    """Função para rodar o Flask em uma thread separada."""
    app.run(host="0.0.0.0", port=get_api_port(), debug=False, use_reloader=False)


def start() -> None:
    global server, flask_thread

    if not is_running():
        # Iniciar o servidor Angular
        # server = TCPServer(("0.0.0.0", get_port()), Handler)
        # Thread(target=lambda: server.serve_forever(), daemon=True).start()

        # Iniciar o backend Flask em uma thread separada
        flask_thread = Thread(target=run_flask, daemon=True)
        flask_thread.start()


def stop() -> None:
    global server
    if is_running():
        server.shutdown()


if __name__ == "__main__":
    run_flask()