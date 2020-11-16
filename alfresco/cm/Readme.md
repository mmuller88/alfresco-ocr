# Custom Node creation instruction

Beispiel Model:
https://docs.alfresco.com/6.1/references/dev-extension-points-content-model-define-and-deploy.html

Use the v1 POST or PUT node/{nodeId}/children for creating or update the custom node with a payload like:

```
{
  "name":"Korrespondenz.pdf",
  "nodeType":"unimed:korrespondenz",
  "properties": {
        "unimed:rechnungsNummer": "34191/201901/00073",
        "unimed:briefDatum":"02/07/2019"
    },
    "aspectNames": [
        "unimed:typeCommons"
    ]
}
```

Tip: You could use the api explorer with <host-url>/api-explorer/
