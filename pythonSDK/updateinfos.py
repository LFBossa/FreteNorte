import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore, auth
from datetime import datetime
import json
import time
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

cred = credentials.Certificate(os.getenv("firebase_secret"))
app = firebase_admin.initialize_app(cred)


db = firestore.client()

COLLECTIONS_MAP = [
    ('ambientes', 'json/ambientes.json', 'ambiente_codigo'),  
]


def load_json_file(filename):
    with open(filename) as fp:
        content = json.load(fp)
    return content

def process_permanentes(permanentes_array: list[dict]):
    for x in permanentes_array:
        for key in ["patrimonio", "n_controle" ]:
            try:
                x[key] = str(int(x[key]))
            except TypeError:
                x[key] = None
        
        x["key"] = x["patrimonio"] if x["patrimonio"] else x["n_controle"]

        for key in ["incorporacao", "transf_local"]:  
            try:
                x[key] = datetime.fromisoformat(x[key]) 
            except ValueError:
                x[key] = None

def update_permanentes(ref): 
    collection_ref = db.collection('ambientes')
    doc_ref = collection_ref.document(ref)
    return doc_ref.update({'tipo': 'Físico'})



if __name__ == "__main__":
    for col, file, key in COLLECTIONS_MAP:
        dados = load_json_file(file) 
    for elem in dados:
        print(update_permanentes(elem["ambiente_codigo"]))
        