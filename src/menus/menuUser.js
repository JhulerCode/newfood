const menuUser = [
            {
                id: 'compras',
                label: 'Compras',
                icon: 'fa-solid fa-cart-shopping',
                children: [
                    {
                        label: 'Proveedores',
                        goto: 'vProveedores',
                        permisos: [
                            { id: 'vProveedores:listar', label: 'Listar' },
                            { id: 'vProveedores:crear', label: 'Crear' },
                            { id: 'vProveedores:ver', label: 'Ver' },
                            { id: 'vProveedores:editar', label: 'Editar' },
                            { id: 'vProveedores:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Compras',
                        goto: 'vCompras',
                        permisos: [
                            { id: 'vCompras:listar', label: 'Listar' },
                            { id: 'vCompras:crear', label: 'Crear' },
                            { id: 'vCompras:ver', label: 'Ver' },
                            { id: 'vCompras:editar', label: 'Editar' },
                            { id: 'vCompras:eliminar', label: 'Eliminar' },
                        ],
                    },
                ],
            },
            {
                id: 'ventas',
                label: 'Ventas',
                icon: 'fa-solid fa-store',
                children: [
                    {
                        label: 'Clientes',
                        goto: 'vClientes',
                        permisos: [
                            { id: 'vClientes:listar', label: 'Listar' },
                            { id: 'vClientes:crear', label: 'Crear' },
                            { id: 'vClientes:ver', label: 'Ver' },
                            { id: 'vClientes:editar', label: 'Editar' },
                            { id: 'vClientes:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Pedidos',
                        goto: 'vPedidos',
                        permisos: [
                            { id: 'vPedidos:listar', label: 'Listar' },
                            { id: 'vPedidos:crear', label: 'Crear' },
                            { id: 'vPedidos:ver', label: 'Ver' },
                            { id: 'vPedidos:editar', label: 'Editar' },
                            { id: 'vPedidos:addProductos', label: 'Añadir productos' },
                            { id: 'vPedidos:editarDetalles', label: 'Editar detalles' },
                            { id: 'vPedidos:anular', label: 'Anular' },
                            // { id: 'vPedidos:editar', label: 'Editar' },
                            { id: 'vPedidos:eliminar', label: 'Eliminar' },

                            { id: 'vPedidos:imprimirComanda', label: 'Reimprimir pedido' },
                            { id: 'vPedidos:imprimirPrecuenta', label: 'Imprimir precuenta' },
                            { id: 'vPedidos:verComprobantes', label: 'Ver comprobantes' },
                            { id: 'vPedidos:entregar', label: 'Confirmar entrega' },

                            { id: 'vPedidos:unirMesas', label: 'Unir mesas' },
                            { id: 'vPedidos:cambiarMesa', label: 'Cambiar mesa' },
                        ],
                    },
                    {
                        label: 'Punto de venta',
                        goto: 'vPos',
                        permisos: [{ id: 'vPos:crear', label: 'Crear' }],
                    },
                ],
            },
            {
                id: 'caja',
                label: 'Caja',
                icon: 'fa-solid fa-cash-register',
                children: [
                    {
                        label: 'Apertura y cierre',
                        goto: 'vCajaResumen',
                        permisos: [
                            { id: 'vCajaResumen:ver', label: 'Ver resumen' },
                            { id: 'vCajaResumen:aperturar', label: 'Aperturar caja' },
                            { id: 'vCajaResumen:cerrar', label: 'Cerrar caja' },
                        ],
                    },
                    {
                        label: 'Ingresos y egresos',
                        goto: 'vCajaMovimientos',
                        permisos: [
                            { id: 'vCajaMovimientos:listar', label: 'Listar' },
                            { id: 'vCajaMovimientos:crear', label: 'Crear' },
                            { id: 'vCajaMovimientos:editar', label: 'Editar' },
                            { id: 'vCajaMovimientos:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Pedidos',
                        goto: 'vCajaPedidos',
                        permisos: [
                            { id: 'vCajaPedidos:listar', label: 'Listar' },
                            { id: 'vCajaPedidos:ver', label: 'Ver' },
                            { id: 'vCajaPedidos:verComprobantes', label: 'Ver comprobantes' },
                        ],
                    },
                    {
                        label: 'Comprobantes',
                        goto: 'vCajaComprobantes',
                        permisos: [
                            { id: 'vCajaComprobantes:listar', label: 'Listar' },
                            { id: 'vCajaComprobantes:crear', label: 'Crear' },
                            { id: 'vCajaComprobantes:ver', label: 'Ver' },
                            { id: 'vCajaComprobantes:anular', label: 'Anular' },
                            { id: 'vCajaComprobantes:canjear', label: 'Canjear' },
                            { id: 'vCajaComprobantes:verPagos', label: 'Ver pagos' },
                            { id: 'vCajaComprobantes:agregarPagos', label: 'Agregar pagos' },
                            { id: 'vCajaComprobantes:editarPagos', label: 'Editar pagos' },
                            { id: 'vCajaComprobantes:enviarCorreo', label: 'Enviar por email' },
                            {
                                id: 'vCajaComprobantes:enviarWhatsapp',
                                label: 'Enviar por whatsapp',
                            },
                            { id: 'vCajaComprobantes:imprimir', label: 'Imprimir' },
                            { id: 'vCajaComprobantes:descargarPdf', label: 'Descargar PDF' },
                        ],
                    },
                ],
            },
            {
                id: 'inventario',
                label: 'Inventario',
                icon: 'fa-solid fa-boxes-stacked',
                children: [
                    {
                        label: 'Insumos',
                        goto: 'vInventarioInsumos',
                        permisos: [
                            { id: 'vInventarioInsumos:listar', label: 'Listar' },
                            { id: 'vInventarioInsumos:kardex', label: 'Ver kardex' },
                            { id: 'vInventarioInsumos:ajusteStock', label: 'Ajuste stock' },
                        ],
                    },
                    {
                        label: 'Productos',
                        goto: 'vInventarioProductos',
                        permisos: [
                            { id: 'vInventarioProductos:listar', label: 'Listar' },
                            { id: 'vInventarioProductos:kardex', label: 'Ver kardex' },
                            { id: 'vInventarioProductos:ajusteStock', label: 'Ajuste stock' },
                        ],
                    },
                ],
            },
            {
                id: 'reportes',
                label: 'Reportes',
                icon: 'fa-solid fa-chart-line',
                children: [
                    {
                        label: 'Pedidos',
                        goto: 'vReportePedidos',
                        permisos: [
                            { id: 'vReportePedidos:listar', label: 'Listar' },
                            { id: 'vReportePedidos:ver', label: 'Ver' },
                            { id: 'vReportePedidos:verComprobantes', label: 'Ver comprobantes' },
                        ],
                    },
                    {
                        label: 'Comprobantes',
                        goto: 'vReporteComprobantes',
                        permisos: [
                            { id: 'vReporteComprobantes:listar', label: 'Listar' },
                            { id: 'vReporteComprobantes:anular', label: 'Anular' },
                            { id: 'vReporteComprobantes:canjear', label: 'Canjear' },
                            { id: 'vReporteComprobantes:verPagos', label: 'Ver pagos' },
                            { id: 'vReporteComprobantes:agregarPagos', label: 'Agregar pagos' },
                            { id: 'vReporteComprobantes:editarPagos', label: 'Editar pagos' },
                            { id: 'vReporteComprobantes:enviarCorreo', label: 'Enviar por email' },
                            { id: 'vReporteComprobantes:enviarWhatsapp', label: 'Enviar por whatsapp' },
                            { id: 'vReporteComprobantes:imprimir', label: 'Imprimir' },
                            { id: 'vReporteComprobantes:descargarPdf', label: 'Descargar PDF' },
                            // { id: 'vReporteComprobantes:descargarXml', label: 'Descargar XML' },
                            // { id: 'vReporteComprobantes:descargarCdr', label: 'Descargar CDR' },
                            {
                                id: 'vReporteComprobantes:consultarEstado',
                                label: 'Consultar estado',
                            },
                        ],
                    },
                    {
                        label: 'Comprobantes detallado',
                        goto: 'vComprobantesDetallado',
                        permisos: [{ id: 'vComprobantesDetallado:listar', label: 'Listar' }],
                    },
                    {
                        label: 'Aperturas de caja',
                        goto: 'vCajaAperturas',
                        permisos: [
                            { id: 'vCajaAperturas:listar', label: 'Listar' },
                            { id: 'vCajaAperturas:verResumen', label: 'Ver resumen' },
                            { id: 'vCajaAperturas:imprimirResumen', label: 'Imprimir resumen' },
                        ],
                    },
                    {
                        label: 'Ingresos y egresos',
                        goto: 'vDineroMovimientos',
                        permisos: [{ id: 'vDineroMovimientos:listar', label: 'Listar' }],
                    },
                    {
                        label: 'Dashboard',
                        goto: 'vDashboard',
                        permisos: [{ id: 'vDashboard:ver', label: 'Listar' }],
                    },
                ],
            },
            {
                id: 'ajustes',
                label: 'Ajustes',
                icon: 'fa-solid fa-gear',
                children: [
                    {
                        label: 'Empresa',
                        goto: 'vEmpresa',
                        permisos: [
                            { id: 'vEmpresa:ver', label: 'Ver' },
                            { id: 'vEmpresa:editar', label: 'Editar' },
                        ],
                    },
                    {
                        label: 'Sucursales',
                        goto: 'vSucursales',
                        permisos: [
                            { id: 'vSucursales:listar', label: 'Listar' },
                            { id: 'vSucursales:crear', label: 'Crear' },
                            { id: 'vSucursales:ver', label: 'Ver' },
                            { id: 'vSucursales:editar', label: 'Editar' },
                            { id: 'vSucursales:eliminar', label: 'Eliminar' },
                            { id: 'vSucursales:cambiarSucursal', label: 'Cambiar de sucursal' },

                            { id: 'vImpresionAreas:listar', label: 'Áreas de impresión - Listar' },
                            { id: 'vImpresionAreas:crear', label: 'Áreas de impresión - Crear' },
                            { id: 'vImpresionAreas:editar', label: 'Áreas de impresión - Editar' },
                            {
                                id: 'vImpresionAreas:eliminar',
                                label: 'Áreas de impresión - Eliminar',
                            },
                        ],
                    },
                    {
                        label: 'Salones y mesas',
                        goto: 'vSalones',
                        permisos: [
                            { id: 'vSalones:listar', label: 'Listar' },
                            { id: 'vSalones:crear', label: 'Crear' },
                            { id: 'vSalones:editar', label: 'Editar' },
                            { id: 'vSalones:eliminar', label: 'Eliminar' },
                            { id: 'vSalones:listarMesa', label: 'Listar mesas' },
                            { id: 'vSalones:crearMesa', label: 'Crear mesa' },
                            { id: 'vSalones:editarMesa', label: 'Editar mesa' },
                            { id: 'vSalones:eliminarMesa', label: 'Eliminar mesa' },
                        ],
                    },
                    {
                        label: 'Tipos de comprobante',
                        goto: 'vComprobanteTipos',
                        permisos: [
                            { id: 'vComprobanteTipos:listar', label: 'Listar' },
                            { id: 'vComprobanteTipos:crear', label: 'Crear' },
                            { id: 'vComprobanteTipos:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Métodos de pago',
                        goto: 'vPagoMetodos',
                        permisos: [
                            { id: 'vPagoMetodos:listar', label: 'Listar' },
                            { id: 'vPagoMetodos:crear', label: 'Crear' },
                            { id: 'vPagoMetodos:editar', label: 'Editar' },
                            { id: 'vPagoMetodos:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Categorías',
                        goto: 'vArticuloCategorias',
                        permisos: [
                            { id: 'vArticuloCategorias:listar', label: 'Listar' },
                            { id: 'vArticuloCategorias:crear', label: 'Crear' },
                            { id: 'vArticuloCategorias:editar', label: 'Editar' },
                            { id: 'vArticuloCategorias:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Insumos',
                        goto: 'vInsumos',
                        permisos: [
                            { id: 'vInsumos:listar', label: 'Listar' },
                            { id: 'vInsumos:crear', label: 'Crear' },
                            { id: 'vInsumos:editar', label: 'Editar' },
                            { id: 'vInsumos:eliminar', label: 'Eliminar' },

                            { id: 'vInsumos:clonar', label: 'Clonar' },

                            { id: 'vInsumos:crearBulk', label: 'Crear masivo' },
                            { id: 'vInsumos:editarBulk', label: 'Editar masivo' },
                            { id: 'vInsumos:eliminarBulk', label: 'Eliminar masivo' },
                        ],
                    },
                    {
                        label: 'Productos',
                        goto: 'vProductos',
                        permisos: [
                            { id: 'vProductos:listar', label: 'Listar' },
                            { id: 'vProductos:crear', label: 'Crear' },
                            { id: 'vProductos:editar', label: 'Editar' },
                            { id: 'vProductos:eliminar', label: 'Eliminar' },

                            { id: 'vProductos:clonar', label: 'Clonar' },

                            { id: 'vProductos:crearBulk', label: 'Crear masivo' },
                            { id: 'vProductos:editarBulk', label: 'Editar masivo' },
                            { id: 'vProductos:eliminarBulk', label: 'Eliminar masivo' },

                            { id: 'vProductos:listarReceta', label: 'Listar receta' },
                            { id: 'vProductos:crearReceta', label: 'Crear receta' },
                            { id: 'vProductos:editarReceta', label: 'Editar receta' },
                            { id: 'vProductos:eliminarReceta', label: 'Eliminar receta' },
                        ],
                    },
                    {
                        label: 'Combos',
                        goto: 'vCombos',
                        permisos: [
                            { id: 'vCombos:listar', label: 'Listar' },
                            { id: 'vCombos:crear', label: 'Crear' },
                            { id: 'vCombos:editar', label: 'Editar' },
                            { id: 'vCombos:eliminar', label: 'Eliminar' },

                            { id: 'vCombos:crearBulk', label: 'Crear masivo' },
                            { id: 'vCombos:editarBulk', label: 'Editar masivo' },
                            { id: 'vCombos:eliminarBulk', label: 'Eliminar masivo' },
                            {
                                id: 'vCombos:crearComponentesBulk',
                                label: 'Crear componentes masivo',
                            },
                        ],
                    },
                    {
                        label: 'Colaboradores',
                        goto: 'vColaboradores',
                        permisos: [
                            { id: 'vColaboradores:listar', label: 'Listar' },
                            { id: 'vColaboradores:crear', label: 'Crear' },
                            { id: 'vColaboradores:ver', label: 'Ver' },
                            { id: 'vColaboradores:editar', label: 'Editar' },
                            { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                        ],
                    },
                ],
            },
        ]

export default menuUser
