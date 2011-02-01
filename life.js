$(document).ready(function(){

    //internal representation of a game of life.
    function game(rows,cols,rule){
	var game = {};
	var tiles = createBoard(rows, cols);
	
	//initialize the board to the number of tiles requested.
	function createBoard(rows, cols){
	    var rowIndex, colIndex, currentId, tiles = [];
	    for(rowIndex = 0; rowIndex < rows; rowIndex++){
		tiles[rowIndex] = [];
		for (colIndex = 0; colIndex < cols; colIndex++){
		    tiles[rowIndex][colIndex] = {alive: false, previous: false};
		}
	    }
	    return tiles;
	}

	function adjacentTiles(row, col){
	    return {
		 topLeft : (row > 0 && col > 0) ? tiles[row-1][col-1].alive : undefined,
		 top : (row > 0) ? tiles[row-1][col].alive : undefined,
		 topRight : (row > 0 && col < cols-1) ? tiles[row-1][col+1].alive : undefined,
		 left : (col > 0) ? tiles[row][col-1].alive : undefined,
		 right : (col < cols-1) ? tiles[row][col+1].alive : undefined,
		 bottomLeft : (row < rows-1 && col > 0) ? tiles[row+1][col-1].alive : undefined,
		 bottom : (row < rows-1) ? tiles[row+1][col].alive : undefined,
		 bottomRight : (row < rows-1 && col < cols-1) ? tiles[row+1][col+1].alive : undefined
	    };
	}	
	//advances the game to the next state, using the rule provided when initializing
	function advanceState(){
	    var rowIndex, 
	    colIndex, 
	    newTiles = []; 
	    for (rowIndex = 0; rowIndex < rows; rowIndex++){
		newTiles[rowIndex] = [];
		for (colIndex = 0; colIndex < cols; colIndex++){
		    newTiles[rowIndex][colIndex] = {
			previous : tiles[rowIndex][colIndex].alive,
			alive : rule(tiles[rowIndex][colIndex].alive,
				     adjacentTiles(rowIndex, colIndex))
		    };
		}
	    }
	    tiles = newTiles;
	    return game;
	}
    
	//Change a tile from alive to dead
	function toggle(row, col){
	    var tile = tiles[row][col];
	    tile.previous = tile.alive;
	    tile.alive = !tile.alive;
	    return game;
	}

	//Check whether a tile is currently alive
	function alive(row, col){
	    return tiles[row][col].alive;
	}

	//Check whether a tile has changed status between the last game state and the current
	function changed(row, col){
	    return tiles[row][col].alive !== tiles[row][col].previous;
	}

	//provide public functions and data
	game.advanceState = advanceState;
	game.toggle = toggle;
	game.cols = cols;
	game.rows = rows;
	game.alive = alive;
	game.changed = changed;
	return game;
    }

	    

    //create an html visualization of a gameboard
    function createUI(container, game){
	var rowIndex, colIndex, currentId, currentElement;
	
	container.empty();

	for (rowIndex = 0; rowIndex < game.rows; rowIndex++){
	    for (colIndex = 0; colIndex < game.cols; colIndex++){
		currentId = 'r' + rowIndex + 'c' + colIndex;
		container.append("<div class='tile' id='" + currentId + "'></div>");
		currentElement = $('#' + currentId);
		currentElement.click(
		    function(row, column)
		    {
			return function()
			{
			    game.toggle(row, column);
			    $(this).toggleClass('alive');
			};
		    }(rowIndex, colIndex));
		currentElement.hover(
		    function() {
			$(this).addClass("selected");
		    },
		    function() {
			$(this).removeClass("selected");
		    })
	    }
	}
    }

    //render the current gamestate.
    function render(container, game)
    {
	var rowIndex, colIndex;
	for (rowIndex = 0; rowIndex < game.rows; rowIndex++){
	    for (colIndex = 0; colIndex < game.cols; colIndex++){
		if (game.changed(rowIndex, colIndex)){
		    if (game.alive(rowIndex, colIndex)){
			$('#r' + rowIndex + 'c' + colIndex).addClass('alive');
		    } else {
			$('#r' + rowIndex + 'c' + colIndex).removeClass('alive');
		    }
		}
	    }
	}
    }

    //Define the traditional rule of Conway's game of life (B3/S32)
    function traditionalRule(currentState, surroundingValues){
	var key, sum=0;
	for(key in surroundingValues){
	    if (surroundingValues.hasOwnProperty(key) && surroundingValues[key]){sum++;}
	}
	return (sum===3 || (currentState && sum === 2))
    }



    var game = game(25, 50, traditionalRule),
        board = $(".gameboard"),
        maxCols = 100,
        gameInterval;

    createUI(board, game);
    $('#advance').click(function(){ render(board, game.advanceState()) });
    $('#run').click(function() {
	if (this.textContent === 'Pause'){
	    clearInterval(gameInterval);
	    this.textContent = 'Run';
	} else {
	    gameInterval = setInterval(function(){ render(board, game.advanceState()) }, 250);
	    this.textContent = 'Pause';
	}
    });

});