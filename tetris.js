var player1, mute;

document.addEventListener("DOMContentLoaded", function(){
	player1 = document.querySelector("audio");
	mute = document.querySelector("#mute");
	mute.addEventListener("click", function(){
		player1.pause();
	});
});



const canvas = document.querySelector('#tetris');
const context = canvas.getContext('2d');
context.scale(20, 20); //scales the context in the canvas 20x larger

// const matrix = [
// 	[0, 0, 0],
// 	[1, 1, 1],
// 	[0, 1, 0],
// ]; //Letter T. 0 are empty spaces


//y is row, x is column
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;

            }
        }
    }
    return false;
}

function createMatrix(w, h) {
	const matrix = [];
	while (h--) { 
	//looping while height is not 0 we decrease height with 1
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece (type) {
	if (type === 'T'){
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0],
		];
	} else if (type === 'I'){
		return [
			[0, 2, 0, 0],
			[0, 2, 0, 0],
			[0, 2, 0, 0],
			[0, 2, 0, 0],
		];
	} else if (type === 'J'){
		return [
			[0, 3, 0],
			[0, 3, 0],
			[3, 3, 0],
		];
	} else if (type === 'L'){
		return [
			[0, 4, 0],
			[0, 4, 0],
			[0, 4, 4],
		];
	} else if (type === 'O'){
		return [
			[5, 5],
			[5, 5],
		];
	} else if (type === 'S'){
		return [
			[0, 6, 6],
			[6, 6, 0],
			[0, 0, 0],
		];
	} else if (type === 'Z'){
		return [
			[7, 7, 0],
			[0, 7, 7],
			[0, 0, 0],
		];
	}
}

const colors = [
	null,
	'#8a00e6', //a shade of purple
	'#00ffff', //cyan
	'#ff6699', //a shade of pink
	'#ff8c1a', // a shade of orange
	'#ffff1a', // a shade of yelloe
	'#e60000', // a shade of red
	'#00ff00' //a shade of green/lime
];

function draw(){
	context.fillStyle = '#202028'; 
	context.fillRect(0, 0, canvas.width, canvas.height); 
	
	drawMatrix(arena, {x: 0, y: 0});
	drawMatrix(player.matrix, player.pos);
} // allowing the context.fill and rect in the draw allows to clear 
//previous tetris piece when it is moved

function drawMatrix(matrix, offset) {
	matrix.forEach((row, y) =>{
		row.forEach((value, x) =>{
			if (value !== 0){
				context.fillStyle = colors[value];
				context.strokeStyle = '#000000';
				context.lineWidth = 0.025;
				context.fillRect(x + offset.x, y + offset.y, 1, 1);
				context.strokeRect(x + offset.x, y + offset.y, 1, 1); 
			}
		});
	});
}

function merge (arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) { //copy the value into the arena
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		});
	});
}

function playerDrop() {
    player.pos.y++; //drops one position down
    if (collide(arena, player)) {
    	//following code is if the piece hits the bottom or collides with another piece, it brings it back to the top
        player.pos.y--;
        merge(arena, player);
        playerRandomizer();
        removeRow();
        updateScore();

        // player.pos.y = 0;
        // arenaSweep();
        // updateScore();
    }
    dropCounter = 0; //brings the drop counter back to zero and starts counting again from the beginning
}
 //following function is so the tetris matrix piece doesnt leave the canvas
function playerMove(dir) {
	player.pos.x += dir; 
	if (collide(arena, player)){
		player.pos.x -= dir;
	}
}

//randomizes the next piece to fll from the top
function playerRandomizer() {
	const pieces = 'TIJLOSZ'
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); // the | means floor
	//put piece at the top
	player.pos.y = 0;
	//put piece in the center
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
	//instering a collide function to detect the game is over when a piece hits the top of the canvas
	//function should remove everything from the arena
	if (collide(arena, player)){
		arena.forEach(row => row.fill(0));
		player.score = 0;
		updateScore();
	}
}

//made an offset and while loop so you can not rotate outside of the walls
function playerRotate(dir) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)){
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1));
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir) {
	//allows us to transpose the matrix from rows into colums to then reverse the columns, allowing us to rotate
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [ matrix[x][y], matrix[y][x], ] = [ matrix[y][x], matrix[x][y], ];
        }
    } 
	if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

//function to remove the bottom row when the values dont equal 0s (when the rows filled up)
function removeRow(){
	let rowCount = 1;
	outer: for (let y = arena.length - 1; y > 0; --y) { //looping from the bottom of the canvas
		for (let x = 0; x < arena[y].length; ++x) {
			if (arena[y][x] === 0) {
				continue outer; //outer allows me to reverse the for loop
			}
		}
		const row = arena.splice(y, 1)[0].fill(0);
		arena.unshift(row);
		++y; //offset the y
		console.log("Removed Row")

		player.score += rowCount * 12;
		rowCount *= 2;
	}
}

let dropCounter = 0;
let dropInterval = 1000;

// var easyButton;

// document.addEventListener("DOMContentLoaded"){
// 	easyButton = document.querySelector('#easy');
// 	easyButton.addEventListener("click", function(){
// 		dropInterval = 500;
// 	});
// }
document.easyButton = document.querySelector('#hard').addEventListener('click', function(){
	changeSpeedToHard();
	console.log("Level Changed to Hard");
});
document.easyButton = document.querySelector('#medium').addEventListener('click', function(){
	changeSpeedToMed();
	console.log("Level Changed to Medium");
});
document.easyButton = document.querySelector('#easy').addEventListener('click', function(){
	changeSpeedToEasy();
	console.log("Level Changed to Easy");
});

function changeSpeedToHard(){ dropInterval = 250;}
function changeSpeedToMed(){ dropInterval = 650;}
function changeSpeedToEasy(){ dropInterval = 1000;}

let lastTime = 0;
function update(time = 0){ 
//this entire function allows the piece to drop one row every second
	const deltaTime = time - lastTime;
	lastTime = time;
	dropCounter += deltaTime;
	if (dropCounter > dropInterval){ //only occurs if the dropcounter increase passed one second
		playerDrop(); 
	}
	// console.log(deltaTime);
	draw();
	requestAnimationFrame(update);
}

function updateScore() {
	document.querySelector('#score').innerText = player.score;
	// if(player.score == 12 && player.lastCongrats != 12 ){
	// 	player.lastCongrats = 12;
	// 	alert("Congrats!");
	// }
}

const arena = createMatrix(12, 20);
// console.log(arena);
// console.table(arena);

const player = {
	pos: {x: 0, y: 0},
	matrix: null,
	score: 0,
	// lastCongrats: 0
}

//when the keys is pressed on keyboard
document.addEventListener('keydown', event => {
	if (event.keyCode === 37) {
		playerMove(-1); //moves position to the left once each time left key is pressed
		console.log("moved Left");
	} else if (event.keyCode === 39) {
		playerMove(1); //moves position to the right once each time right key is pressed
		console.log("Moved Right");
	} else if (event.keyCode === 40) {
 		playerDrop();//to give it th[e one second delay if user lets button go. without it. it looks glitchy
		console.log("Pressed-Moved Down");
	} else if (event.keyCode === 81) { //81= key Q
		playerRotate(-1);
		console.log("Rotate Right");
	} else if (event.keyCode === 87) { //87 = key W
		playerRotate(1);
		console.log("Rotated Left");
	}
});

playerRandomizer();
updateScore();
update();

















