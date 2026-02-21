
document.addEventListener('DOMContentLoaded', () => {
    fetch('recetas.json')
        .then(response => response.json())
        .then(recetas => {
            renderRecetario(recetas);
        })
        .catch(error => console.error('Error cargando recetas:', error));
});

function renderRecetario(recetas) {
    const pagesContainer = document.getElementById('pages');
    
    // 1. Render Index Page
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

    // 2. Render Recipe Pages
    recetas.forEach(receta => {
        // First page of the recipe
        let currentSection = document.createElement('section');
        let sectionDiv = document.createElement('div');
        
        let headerHtml = `
            <div class="cabecera">
              <h2>${receta.titulo}</h2>
              <div class="num">${receta.id}</div>
            </div>`;
        
        if (receta.subtitulo) {
            headerHtml += `<div class="cabecera-bis"><p>${receta.subtitulo}</p></div>`;
        }

        let contentHtml = headerHtml;
        contentHtml += `<p class="preparacion__texto--p"><strong>Ingredientes:</strong></p>`;
        
        receta.ingredientes.forEach(ing => {
            contentHtml += `<p class="ingredientes-p">-&nbsp; ${ing}</p>`;
        });

        contentHtml += `<hr color="#064A89" size="1" width="150" />`;
        contentHtml += `<p class="preparacion__texto--p"><strong>Preparación:</strong></p>`;

        // We need to handle preparation paragraphs and potential overflow
        // For simplicity, we assume preparation is a list of paragraphs.
        // If there are multiple paragraphs, we might need a "next" page.
        
        let prepItems = [...receta.preparacion];
        let firstPagePrep = prepItems.shift(); // Take first paragraph
        
        contentHtml += `<p class="preparacion__texto--p">${firstPagePrep}</p>`;
        
        // If there's more preparation or a variant, add a "next" symbol and create new page
        if (prepItems.length > 0 || receta.variante) {
            contentHtml += `<p class="siguiente">></p>`;
            sectionDiv.innerHTML = contentHtml;
            currentSection.appendChild(sectionDiv);
            pagesContainer.appendChild(currentSection);

            // Create subsequent pages
            while (prepItems.length > 0) {
                currentSection = document.createElement('section');
                sectionDiv = document.createElement('div');
                let nextPrep = prepItems.shift();
                let innerHtml = `<br /><p>${nextPrep}</p>`;
                
                if (prepItems.length === 0 && receta.variante) {
                    innerHtml += `<p class="preparacion__texto--p"><strong>Variante:</strong></p>`;
                    innerHtml += `<p>${receta.variante}</p>`;
                }
                
                if (prepItems.length > 0) {
                    innerHtml += `<p class="siguiente">></p>`;
                } else {
                    innerHtml += `<hr color="#064A89" size="1" width="150" />`;
                }

                sectionDiv.innerHTML = innerHtml;
                currentSection.appendChild(sectionDiv);
                pagesContainer.appendChild(currentSection);
            }
        } else {
            sectionDiv.innerHTML = contentHtml;
            currentSection.appendChild(sectionDiv);
            pagesContainer.appendChild(currentSection);
        }
    });

    // 3. Initialize PageFlip
    if (window.initPageFlip) {
        window.initPageFlip();
    }
}
