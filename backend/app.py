from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import mimetypes
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__)
CORS(app) 

folders = []
initial_path = '/home/eduardo_araujo/Documentos/project/dataset'
images_path = '/home/eduardo_araujo/Documentos/project/dataset'

class FolderHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            update_folders(initial_path)

    def on_deleted(self, event):
        if event.is_directory:
            update_folders(initial_path)

def update_folders(directory_path):
    global folders
    try:
        folders = [name for name in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, name))]
    except Exception as e:
        print(f'Error reading directory {directory_path}: {e}')

def get_images(directory_path):
    try:
        return [name for name in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, name)) and mimetypes.guess_type(name)[0] and mimetypes.guess_type(name)[0].startswith('image')]
    except Exception as e:
        print(f'Error reading directory {directory_path}: {e}')
        return []

update_folders(initial_path)

event_handler = FolderHandler()
observer = Observer()
observer.schedule(event_handler, initial_path, recursive=False)
observer.start()

@app.route('/folders', methods=['GET'])
def get_folders():
    return jsonify(folders)



@app.route('/images', methods=['GET'])
def get_images_in_folder():
    folder_name = request.args.get('folder')
    directory_path = os.path.join(initial_path, folder_name)
    images = get_images(directory_path)
    return jsonify(images)

@app.route('/static/images/<path:filename>', methods=['GET'])
def serve_image(filename):
    return send_from_directory(images_path, filename)

if __name__ == '__main__':
    try:
        app.run(port=3000)
    finally:
        observer.stop()
        observer.join()
