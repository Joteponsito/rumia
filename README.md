# Rumia para Android

Este proyecto genera el APK de Rumia en la nube de GitHub, gratis. No hace falta instalar nada en la computadora.

## Pasos (una sola vez, unos 15 minutos)

1. Cree una cuenta gratis en github.com, si no tiene.
2. Arriba a la derecha toque **+** → **New repository**. Póngale de nombre `rumia`, déjelo **Private** y toque **Create repository**.
3. En la página nueva toque **uploading an existing file**. Arrastre TODO el contenido de esta carpeta, incluida la carpeta `.github`. Toque **Commit changes**.
   - La carpeta `.github` está oculta en Windows y Mac. En Windows: Explorador → Vista → Mostrar → Elementos ocultos.
4. Entre a la pestaña **Actions**. Verá "Construir APK de Rumia" trabajando. Tarda de 5 a 8 minutos.
5. Cuando tenga el check verde, entre a esa corrida y baje **Rumia-APK** al final de la página. Adentro viene `Rumia.apk`.

## Instalarla en el teléfono

1. Pase `Rumia.apk` al teléfono (WhatsApp, correo, Drive o cable).
2. Ábralo. Android pedirá permiso para instalar apps de este origen: acéptelo.
3. Si aparece Google Play Protect, toque **Instalar de todas formas**. Pasa con cualquier app que no viene de la Play Store.

## Actualizar la app

Cambie `www/index.html` por la versión nueva y súbalo de nuevo al repositorio. GitHub arma solo un APK nuevo.
