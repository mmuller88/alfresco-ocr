# Alfresco OCR
That demo deployment was created with https://github.com/Alfresco/alfresco-docker-installer . Please read the documentation over there!

Urls:
http://localhost:80/share 
http://localhost:80/alfresco
http://localhost:80 
http://localhost:80/api-explorer

## Start Backend
Use the starting script!

```
./start.sh
```

## Destroy Container

```
./start.sh -d
```

## Destroy Container + Delete Volumes

```
./start.sh -d && sudo rm -rf data logs
```

# OCR
Originated from https://github.com/keensoft/alfresco-simple-ocr. Helpful as well was:

* https://hub.alfresco.com/t5/alfresco-content-services-forum/quot-ocr-extract-quot-action-doesn-t-work-well-alfresco-simple/td-p/193329

# Search
Example Solr queries:

* TYPE:"m:type"
* TYPE:"m:type" AND m:othertype:"bob"

* TYPE:"m:type"
* TYPE:"m:type" AND m:othertype:331.36
* TYPE:"m:type" AND m:othertype:[0 TO 400]