# Solucionario Privado para el Profesor - Cuestionarios del Módulo XI
## Diplomado en Contabilidad Financiera - UCSAR
### MÓDULO 11: APLICACIONES INFORMÁTICAS DE CONTABILIDAD

> [!CAUTION]
> **DOCUMENTO EXCLUSIVO DEL DOCENTE**
> Este archivo contiene la resolución oficial de los cuestionarios del Módulo XI. **No subir al servidor web público.**

---

## 💻 UNIDAD DIDÁCTICA 1: Estructura de Programas Contables

### Pregunta 1.1: Criterios para Selección de Software Contable
**Pregunta:**  
Mencione los 4 criterios clave que debe evaluar una empresa venezolana al elegir un software contable (ej. Profit Plus, Saint, Galac, SAP).

**Solución Oficial:**  
1. **Adaptabilidad a la Normativa Venezolana (SENIAT):** Capacidad nativa de emitir Libros de IVA (Providencia 0049), manejo de retenciones de IVA/ISLR y ajuste por inflación.
2. **Escalabilidad y Arquitectura:** Soporte mulitiempresa, multisucursal y base de datos relacional robusta (SQL Server, PostgreSQL, Oracle).
3. **Seguridad y Auditoría (Log de Transacciones):** Registro inalterable de usuarios, fecha, hora y modificaciones a los asientos.
4. **Integración Modular:** Conexión nativa con módulos de Inventarios, Nómina, Cuentas por Cobrar y Cuentas por Pagar.

---

## 🏢 UNIDAD DIDÁCTICA 2: El Alta de Empresas y Plan de Cuentas

### Pregunta 2.1: Parametrización Inicial de una Empresa
**Pregunta:**  
¿Cuáles datos iniciales son indispensables al dar de alta una entidad en un sistema contable informático?

**Solución Oficial:**  
- Datos de Identificación (Razón Social, RIF, Dirección Fiscal, Ejercicio Económico Inicio/Cierre).
- Estructura del Plan de Cuentas (Máscara de cuentas: Ej. `1.1.01.001`).
- Definición de Moneda Funcional y Moneda de Presentación (Bs y USD).
- Configuración de Alícuotas Tributarias (IVA 16%, 8%, Retenciones).

---

## 🔒 UNIDAD DIDÁCTICA 3 & 4: Seguridad, Respaldo y Copias de Seguridad

### Pregunta 3.1: Política de Copias de Seguridad (Backup 3-2-1)
**Pregunta:**  
Explique la regla de respaldo 3-2-1 para proteger la base de datos contable de una empresa.

**Solución Oficial:**  
- **3 Copias:** Mantener 3 copias de los datos (la base de datos de producción y 2 respaldos).
- **2 Medios Distintos:** Almacenar las copias en al menos 2 tipos de medios diferentes (ej. disco duro interno y unidad externa NAS).
- **1 Copia Fuera de la Empresa (Off-site / Cloud):** Almacenar al menos 1 copia fuera de las instalaciones físicas (nube encriptada o servidor remoto) para mitigar riesgos de robo, incendio o desastre natural.
