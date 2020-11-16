# Alfresco Demo
Dieses Demo Deployment wurde mit https://github.com/Alfresco/alfresco-docker-installer erzeugt. Bitte Seite als Dokumentation nutzen!

Urls:
http://localhost:80/share - Alte aber sehr funktionale Browser UI
http://localhost:80/alfresco
http://localhost:80 - Schicke neue Angular UI mit eingeschränkter Funktionalität (Hauptsächlich Archiv. z.B. keine User Create funktion)
http://localhost:80/api-explorer - REST API  Swagger UI

## Start Backend
Nutze direkt das Startscript!

```
./start.sh
```

<!-- Danach muss den Volumes die richtigen Rechte gegeben werden! Das ganze muss nur beim ersten Mal durchgeführt werden.

```
./start.sh -d
sudo chown -R 33007 data/solr-data
sudo chown -R 33007 data/alfresco
sudo chown -R 999 logs
./start.sh
``` -->

## Destroy Container

```
./start.sh -d
```

## Destroy Container + Delete Volumes

```
./start.sh -d && sudo rm -rf data logs
```

# OCR
Entnommen von hier https://github.com/keensoft/alfresco-simple-ocr. Sehr geholfen hat auch:

* https://hub.alfresco.com/t5/alfresco-content-services-forum/quot-ocr-extract-quot-action-doesn-t-work-well-alfresco-simple/td-p/193329

# Search
Beispiel Solr Queries:

* TYPE:"m:type"
* TYPE:"m:type" AND m:othertype:"bob"

* TYPE:"m:type"
* TYPE:"m:type" AND m:othertype:331.36
* TYPE:"m:type" AND m:othertype:[0 TO 400]