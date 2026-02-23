
document.addEventListener('DOMContentLoaded', () => {
    fetch('recetas.json')
        .then(response => response.json())
        .then(recetas => {
            // Esperar a que las fuentes estén cargadas antes de medir
            return document.fonts.ready.then(() => {
                renderRecetario(recetas);
            });
        })
        .catch(error => console.error('Error cargando recetas:', error));
});

function renderRecetario(recetas) {
    const pagesContainer = document.getElementById('pages');
    const PAGE_HEIGHT = 614;
    // Espacio reservado para el marcador ">" al final de la página
    const SIGUIENTE_RESERVE = 30;

    // 1. Renderizar la página del Índice
    const indexSection = document.createElement('section');
    let indexHtml = '<div class="recetario">';
    recetas.forEach(receta => {
        indexHtml += `
            <div class="indice-receta" data-receta="${receta.id}">
              <div class="indice-num">${receta.id}</div>
              <div class="indice-p">${receta.titulo}</div>
            </div>`;
    });
    indexHtml += '</div>';
    indexSection.innerHTML = indexHtml;
    pagesContainer.appendChild(indexSection);

    // Crear un contenedor oculto de medición DENTRO de #pages para heredar los estilos CSS
    const measureSection = document.createElement('section');
    measureSection.style.cssText = 'visibility:hidden;position:absolute;top:-9999px;left:-9999px;pointer-events:none;z-index:-1;overflow:visible;';
    const measureDiv = document.createElement('div');
    // CRÍTICO: anular el height fijo del CSS para que scrollHeight refleje el contenido real
    measureDiv.style.height = 'auto';
    measureSection.appendChild(measureDiv);
    pagesContainer.appendChild(measureSection);

    // 2. Renderizar las páginas de cada receta
    recetas.forEach(receta => {
        let isFirstRecipePage = true;

        // HTML de cabecera (siempre va en la primera página de la receta)
        let headerHtml = `
            <div class="cabecera">
              <h2>${receta.titulo}</h2>
              <div class="num">${receta.id}</div>
            </div>`;

        if (receta.subtitulo) {
            headerHtml += `<div class="cabecera-bis"><p>${receta.subtitulo}</p></div>`;
        }

        headerHtml += `<p class="preparacion__texto--p"><strong>Ingredientes:</strong></p>`;
        receta.ingredientes.forEach(ing => {
            headerHtml += `<p class="ingredientes-p">-&nbsp; ${ing}</p>`;
        });
        headerHtml += `<hr color="#064A89" size="1" width="150" />`;
        headerHtml += `<p class="preparacion__texto--p"><strong>Preparación:</strong></p>`;

        // Lista de todos los elementos de contenido (preparación + variante)
        const contentItems = receta.preparacion.map(p => `<p class="preparacion__texto--p">${p}</p>`);
        if (receta.variante) {
            contentItems.push(`<p class="preparacion__texto--p"><strong>Variante:</strong></p>`);
            contentItems.push(`<p>${receta.variante}</p>`);
        }

        // Función para cerrar y guardar una página
        function commitPage(html, hasMore) {
            const section = document.createElement('section');
            if (isFirstRecipePage) {
                section.setAttribute('data-receta-id', String(receta.id));
                isFirstRecipePage = false;
            }
            const div = document.createElement('div');
            if (hasMore) {
                html += `<p class="siguiente">></p>`;
            } else {
                html += `<hr color="#064A89" size="1" width="150" />`;
            }
            div.innerHTML = html;
            section.appendChild(div);
            pagesContainer.appendChild(section);
        }

        // Distribuir el contenido entre páginas
        let currentHtml = headerHtml;
        const remaining = [...contentItems];

        if (remaining.length === 0) {
            // Sin pasos de preparación: guardar directamente
            commitPage(currentHtml, false);
        } else {
            while (remaining.length > 0) {
                let fittedAny = false;

                // Intentar encajar elementos uno a uno en la página actual
                while (remaining.length > 0) {
                    const testHtml = currentHtml + remaining[0];
                    measureDiv.innerHTML = testHtml;
                    const usedHeight = measureDiv.scrollHeight;

                    // El último elemento no necesita reserva para el marcador ">"
                    const isLastItem = remaining.length === 1;
                    const maxHeight = isLastItem ? PAGE_HEIGHT : PAGE_HEIGHT - SIGUIENTE_RESERVE;

                    if (usedHeight <= maxHeight) {
                        currentHtml = testHtml;
                        remaining.shift();
                        fittedAny = true;
                    } else {
                        break;
                    }
                }

                // Si ningún elemento cupo (párrafo muy largo), forzar su inclusión
                if (!fittedAny && remaining.length > 0) {
                    currentHtml += remaining.shift();
                }

                const hasMore = remaining.length > 0;
                commitPage(currentHtml, hasMore);

                // La siguiente página empieza sin cabecera
                currentHtml = '<br />';
            }
        }
    });

    // Eliminar el contenedor auxiliar de medición
    pagesContainer.removeChild(measureSection);

    // 3. Inicializar PageFlip
    if (window.initPageFlip) {
        window.initPageFlip();
    }
}
