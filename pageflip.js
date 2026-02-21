

(function() {
	
	// Dimensions of the whole book
	// Dimensiones de todo el libro
	var BOOK_WIDTH = 830;
	var BOOK_HEIGHT = 624;
	
	// Dimensions of one page in the book
	// Dimensiones de una página del libro
	var PAGE_WIDTH = 400;
	var PAGE_HEIGHT = 614;
	
	// Vertical spacing between the top edge of the book and the papers
	// Espacio vertical entre el borde superior del libro y los papeles
	var PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;
	
	// The canvas size equals to the book dimensions + this padding
	// El tamaño del lienzo es igual a las dimensiones del libro + este relleno
	var CANVAS_PADDING = 60;
	
	var page = 0;
	
	var canvas = document.getElementById( "pageflip-canvas" );
	var context = canvas.getContext( "2d" );
	
	var mouse = { x: 0, y: 0 };
	
	var flips = [];
	
	var book = document.getElementById( "book" );
	
	// List of all the page elements in the DOM
	// Lista de todos los elementos de la página en el DOM
	var pages = book.getElementsByTagName( "section" );
	
	// Organize the depth of our pages and create the flip definitions
	// Organice la profundidad de nuestras páginas y cree las definiciones de volteo
	for( var i = 0, len = pages.length; i < len; i++ ) {
		pages[i].style.zIndex = len - i;
		
		flips.push( {
			// Current progress of the flip (left -1 to right +1)
			// Progreso actual del flip (izquierda -1 a derecha +1)
			progress: 1,
			// The target value towards which progress is always moving
			// El valor objetivo hacia el que se avanza siempre
			target: 1,
			// The page DOM element related to this flip
			// El elemento DOM de la página relacionado con este cambio
			page: pages[i], 
			// True while the page is being dragged
			// Verdadero mientras se arrastra la página
			dragging: false
		} );
	}
	
	// Resize the canvas to match the book size
	// Cambiar el tamaño del lienzo para que coincida con el tamaño del libro
	canvas.width = BOOK_WIDTH + ( CANVAS_PADDING * 2 );
	canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );
	
	// Offset the canvas so that it's padding is evenly spread around the book
	// Desplaza el lienzo para que su relleno se distribuya uniformemente alrededor del libro
	canvas.style.top = -CANVAS_PADDING + "px";
	canvas.style.left = -CANVAS_PADDING + "px";
	
	// Render the page flip 60 times a second
	// Renderiza el paso de página 60 veces por segundo
	setInterval( render, 1000 / 60 );
	
	document.addEventListener( "mousemove", mouseMoveHandler, false );
	document.addEventListener( "mousedown", mouseDownHandler, false );
	document.addEventListener( "mouseup", mouseUpHandler, false );

	document.addEventListener( "touchstart", touchStartHandler, false );
	document.addEventListener( "touchmove", touchMoveHandler, false );
	document.addEventListener( "touchend", touchEndHandler, false );
	
	function getMousePos(clientX, clientY) {
		var rect = book.getBoundingClientRect();
		// Calculate the current scale factor based on the actual rendered width vs defined width
		var scale = rect.width / BOOK_WIDTH;
		
		return {
			x: (clientX - rect.left - ( (BOOK_WIDTH * scale) / 2 )) / scale,
			y: (clientY - rect.top) / scale
		};
	}

	function mouseMoveHandler( event ) {
		var pos = getMousePos(event.clientX, event.clientY);
		mouse.x = pos.x;
		mouse.y = pos.y;
	}
	
	function touchMoveHandler( event ) {
		var pos = getMousePos(event.touches[0].clientX, event.touches[0].clientY);
		mouse.x = pos.x;
		mouse.y = pos.y;
	}

	function mouseDownHandler( event ) {
		handleStart(mouse.x, mouse.y);
		// Prevents the text selection
		event.preventDefault();
	}

	function touchStartHandler( event ) {
		var pos = getMousePos(event.touches[0].clientX, event.touches[0].clientY);
		mouse.x = pos.x;
		mouse.y = pos.y;
		handleStart(mouse.x, mouse.y);
	}

	function handleStart(x, y) {
		// Make sure the mouse pointer is inside of the book
		if (Math.abs(x) < PAGE_WIDTH) {
			if (x < 0 && page - 1 >= 0) {
				flips[page - 1].dragging = true;
			}
			else if (x > 0 && page + 1 < flips.length) {
				flips[page].dragging = true;
			}
		}
	}
	
	function mouseUpHandler( event ) {
		handleEnd();
	}

	function touchEndHandler( event ) {
		handleEnd();
	}

	function handleEnd() {
		for( var i = 0; i < flips.length; i++ ) {
			if( flips[i].dragging ) {
				if( mouse.x < 0 ) {
					flips[i].target = -1;
					page = Math.min( page + 1, flips.length );
				}
				else {
					flips[i].target = 1;
					page = Math.max( page - 1, 0 );
				}
			}
			flips[i].dragging = false;
		}
	}
	
	function render() {
		
		// Reset all pixels in the canvas
		// Restablecer todos los píxeles en el lienzo
		context.clearRect( 0, 0, canvas.width, canvas.height );
		
		for( var i = 0, len = flips.length; i < len; i++ ) {
			var flip = flips[i];
			
			if( flip.dragging ) {
				flip.target = Math.max( Math.min( mouse.x / PAGE_WIDTH, 1 ), -1 );
			}
			
			// Ease progress towards the target value 
			// Facilitar el progreso hacia el valor objetivo
			flip.progress += ( flip.target - flip.progress ) * 0.2;
			
			// If the flip is being dragged or is somewhere in the middle of the book, render it
			// Si el flip se está arrastrando o está en algún lugar en el medio del libro, renderícelo
			if( flip.dragging || Math.abs( flip.progress ) < 0.997 ) {
				drawFlip( flip );
			}
			
		}
		
	}
	
	function drawFlip( flip ) {
		// Strength of the fold is strongest in the middle of the book
		// La fuerza del pliegue es más fuerte en el medio del libro
		var strength = 1 - Math.abs( flip.progress );
		
		// Width of the folded paper
		// Ancho del papel doblado
		var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );
		
		// X position of the folded paper
		// Posición X del papel doblado
		var foldX = PAGE_WIDTH * flip.progress + foldWidth;
		
		// How far the page should outdent vertically due to perspective
		// Hasta qué punto la página debe tener una sangría vertical debido a la perspectiva
		var verticalOutdent = 20 * strength;
		
		// The maximum width of the left and right side shadows
		// El ancho máximo de las sombras del lado izquierdo y derecho
		var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
		var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		
		
		// Change page element width to match the x position of the fold
		// Cambiar el ancho del elemento de la página para que coincida con la posición x del pliegue
		flip.page.style.width = Math.max(foldX, 0) + "px";
		
		context.save();
		context.translate( CANVAS_PADDING + ( BOOK_WIDTH / 2 ), PAGE_Y + CANVAS_PADDING );
		
		
		// Draw a sharp shadow on the left side of the page
		// Dibuja una sombra nítida en el lado izquierdo de la página
		context.strokeStyle = 'rgba(0,0,0,'+(0.05 * strength)+')';
		context.lineWidth = 30 * strength;
		context.beginPath();
		context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
		context.stroke();
		
		
		// Right side drop shadow
		// Sombra paralela del lado derecho
		var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
		rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
		rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
		
		context.fillStyle = rightShadowGradient;
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX + rightShadowWidth, 0);
		context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.fill();
		
		
		// Left side drop shadow
		// Sombra paralela del lado izquierdo
		var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
		leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
		leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
		
		context.fillStyle = leftShadowGradient;
		context.beginPath();
		context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
		context.lineTo(foldX - foldWidth, 0);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
		context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
		context.fill();
		
		
		// Gradient applied to the folded paper (highlights & shadows)
		// Degradado aplicado al papel doblado (luces y sombras)
		var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
		foldGradient.addColorStop(0.35, '#fafafa');
		foldGradient.addColorStop(0.73, '#eeeeee');
		foldGradient.addColorStop(0.9, '#fafafa');
		foldGradient.addColorStop(1.0, '#e2e2e2');
		
		context.fillStyle = foldGradient;
		context.strokeStyle = 'rgba(0,0,0,0.06)';
		context.lineWidth = 0.5;
		
		// Draw the folded piece of paper
		// Dibuja la hoja de papel doblada
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
		context.lineTo(foldX - foldWidth, -verticalOutdent);
		context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
		
		context.fill();
		context.stroke();
		
		
		context.restore();
	}
	
})();


