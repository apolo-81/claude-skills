# Render + MySQL externo (Hostinger)

Caso real AINCO (2026): frontend carga, login y health fallan. Aísla cada salto antes de tocar contraseñas:

1. ¿El bundle apunta a la API correcta y CORS/preflight responde?
2. ¿Responde el health de la API? Si la API vive pero la BD no, el frontend queda descartado.
3. Interpreta el error: `ETIMEDOUT` antes del saludo MySQL = red/firewall/ruta; `ER_ACCESS_DENIED_ERROR` = usuario, password o grants.
4. Prueba el mismo `host:puerto` desde otra red pública. Si allí llega el saludo MySQL, el servidor vive y el problema es de la ruta desde la nube.

## Render Free no tiene Shell
Añade un diagnóstico **one-shot al arranque**, sin endpoint público ni secretos, que registre: host/puerto sanitizados, resolución DNS y
familia de direcciones, IP pública saliente real y el resultado de un socket TCP con timeout y duración. Retíralo al cerrar el incidente.
Dato del caso: Render `74.220.48.196` a MySQL `193.203.166.183:3306` daba `ETIMEDOUT` a 12 s mientras otra red conectaba en 129 ms.

## Reglas operativas
- Health check de Render que dependa de la BD (`/api/health`).
- Guarda la IP saliente observada **y** los CIDR publicados de la región: una instancia puede rotar de IP.
- En Hostinger revisa Remote MySQL, firewall perimetral y filtros anti-abuso por IP/ASN; un `%` visible no los descarta.
- `traceroute` puede ser descartado aunque TCP 3306 funcione. Una conexión TCP más el saludo MySQL es mejor evidencia.
- Forzar IPv4 o cambiar a Node 22 cambia la forma del timeout pero no fue la causa raíz.
- Reiniciar tu PC o router no prueba nada cuando el origen que falla es Render.
