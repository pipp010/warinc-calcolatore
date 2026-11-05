# War Inc Rising · Calcolatore

Calcolatore per War Inc Rising: copie e fusioni dei personaggi, pietre forgia, probabilità di ottenimento (Ruota, Asso carte, Evocazione limitata), gemme gratuite e costo in euro.

Sito statico (HTML/CSS/JavaScript, nessun programma da installare), pubblicato con GitHub Pages:
https://pipp010.github.io/warinc-calcolatore/

## Struttura

| File | Contenuto |
|---|---|
| `index.html` | struttura delle pagine (Calcolatore, Miniera, Impostazioni, Guida) |
| `css/style.css` | colori, temi chiaro/scuro, versione smartphone |
| `js/dati.js` | **dati di gioco predefiniti** (fonti di carte, pacchetti, pass, QG, gemme gratis, pietre forgia), caricamento e salvataggio |
| `js/calcoli.js` | utilità, fusioni, probabilità, confronto estrazioni, gemme → euro |
| `js/calcolatore.js` | pagina Calcolatore (modalità semplice) |
| `js/zero-shopping.js` | modalità Zero shopping |
| `js/impostazioni.js` | impostazioni e pass già attivi |
| `js/avanzata.js` | pianificazione avanzata |
| `js/miniera.js` | pagina Miniera (per ora nascosta) e tastierino numerico |
| `js/avvio.js` | navigazione e avvio: **sempre ultimo** |

I file JS sono script normali caricati in ordine da `index.html`: ciò che è definito in un file è visibile nei successivi.
Dopo una modifica aumentare il numero `?v=` nei tag di `index.html`, così i browser scaricano la versione nuova.

## Aggiungere una fonte di gemme gratuite

In `js/dati.js`, dentro `DEFAULTS.free`, aggiungere una riga:

```js
free: [ {name:"Guerra infinita", daily:400, on:true}, {name:"Nuova fonte", daily:50, on:true} ],
```

e aumentare `DEFAULTS.ver` (con una migrazione in `loadCfg`) se la fonte deve comparire anche a chi ha già una configurazione salvata.

## Riattivare la Miniera

In `index.html` togliere `hidden` dal pulsante `data-p="mine"`, aggiungere `"mine"` all'elenco delle pagine in `js/avvio.js` e riportare a 4 le colonne di `.tabs` in `css/style.css` (versione smartphone).
