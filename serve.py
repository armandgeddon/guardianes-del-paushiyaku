#!/usr/bin/env python3
"""
Servidor local ultraligero para previsualizar el portal web y el visor geoespacial de Guardianes del Paushiyaku.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def guess_type(self, path):
        # Asegurar tipos MIME correctos para GeoJSON y JavaScript
        if path.endswith('.geojson'):
            return 'application/geo+json'
        elif path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)

def run_server():
    global PORT
    while PORT < 8100:
        try:
            with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
                url = f"http://localhost:{PORT}/"
                print("=" * 60)
                print(f"  Portal Web 'Guardianes del Paushiyaku' Activo")
                print(f"  Servidor iniciado en: {url}")
                print(f"  Visor Geoespacial:   {url}visor.html")
                print("  Presione Ctrl+C para detener el servidor.")
                print("=" * 60)
                webbrowser.open(url)
                httpd.serve_forever()
                break
        except OSError as e:
            if e.errno == 10048 or "Address already in use" in str(e):
                PORT += 1
            else:
                raise e

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nServidor detenido correctamente.")
        sys.exit(0)
