var context;
var canvas;
var puzzleCanvas;
var puzzleContext;
var numberCanvas;
var numberContext;
var puzzleState;
var puzzle;
var puzzles;
var moveArray = new Array();
var fixed = false;
var height;
var width;
var fixedArray = new Array();
var gridSize = 40;
var lineSize = 4;
var padding = 6;
var zoom = 1;
var clicking = false;
var rightClick = false;
var dragging = false;
var lastCell = null;
var clickMode = null;
var editMode = false;
var worker;
var showingErrors = false;
var puzzleComplete = false;
var numberFont = "Calibri, sans-serif";
var incorrectColor = "#efafa7";
var correctColor = "#a7efbd";
var guessColor = "#61B6DD";
var inputColor = "black";
var numberColor = "black";
var backgroundColor = "white";
var gridColor = "#EEEEEE";
var circleColor = "white";
var activeCircleColor = "#DDDDDD";
var isMobile = false;
var numberFont = "Arial, sans-serif";

var activeNumber = "none";
var startNumber = "-";
var drawnLine = false;
var lines;
var accessibleNumbers = {};
var remainingLines = {};
var finishedNumbers;
var invalidNumbers;
var numberCount;
var movesArray;
function init() {

	if((('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) || (window.innerWidth <= 800)) {
    	isMobile = true;
	}else{
		isMobile = false;
	}

	$("#tabs li").click(function() {
		$("#tabs li").removeClass('active');
		$(this).addClass("active");
		$(".tab_content").hide();
		$($(this).find("a").attr("href")).show();
		return false;
	});

	$("#tab1").show();

	$("#generateButton").click(function() {
		//$("#generatedPuzzle").val("");
		//$("#userPuzzle").val("");
		//$("#userSolvePuzzle").val("");
		generate();
	});
	$("#stopGenerationButton").click(function() {
		stopGeneration();
	});
	$("#stopSolvingButton").click(function() {
		stopSolving();
	});
	$("#solveButton").click(function() {
		$("#generatedPuzzle").val("");
		$("#userPuzzle").val("");
		solve();
	});
	$("#displayButton").click(function() {
		$("#generatedPuzzle").val("");
		$("#userSolvePuzzle").val("");
		puzzle = $("#userPuzzle").val()
		display(puzzle);
	});
	$("#checkButton").click(function() {
		checkSolution();
	});
	$("#undoButton").click(function() {
		undo();
	});
	$("#clearButton").click(function() {
		reset();
	});
	$("#saveButton").click(function() {
		save();
	});
	$("#loadButton").click(function() {
		load();
	});
	$("#dailyButton").click(function() {
		//loadDaily();
	});
	$("#displayGridButton").click(function() {
		$("#userSolvePuzzle").val("");
		displayGrid();
	});
	if(isMobile == false){
		$("#numberCanvas").mousedown(function(e) {
			clickMode = null;
			lastCell = null;
			e.preventDefault();
			clicking = true;
			handleClick(e);
		});
		$("#numberCanvas").mousemove(function(e) {
			if(clicking == false) return;
			//e.preventDefault();
			dragging = true;
			if (editMode == false){
				handleClick(e);
			}

		});
		$("#numberCanvas").mouseup(function(e) {
			if(clicking == false) return;
			//e.preventDefault();
			dragging = true;
			if (editMode == false){
				handleClick(e);
			}

		});
		$(document).mouseup(function(){
			clicking = false;
			rightClick = false;
			dragging = false;
			drawnLine = false;
			var temp = startNumber.split("-");
			var startVert = temp[0] * 1;
			var startHor = temp[1] * 1;
			if(startVert){
				if(finishedNumbers.indexOf(startVert + "-" + startHor) == -1){
					drawNumber(puzzleState[startVert][startHor], numberColor, circleColor, startVert, startHor);
				}else if(invalidNumbers.indexOf(startVert + "-" + startHor) != -1){
					drawNumber(puzzleState[startVert][startHor], numberColor, incorrectColor, startVert, startHor);
				}else{
					drawNumber(puzzleState[startVert][startHor], numberColor, correctColor, startVert, startHor);
				}
			}
		});
	}else{

		$("#numberCanvas").click(function(e) {
			clickMode = null;
			lastCell = null;
			//e.preventDefault();
			clicking = true;
			handleClick(e);
			clicking = false;
			rightClick = false;
			dragging = false;
		});
	}
	$("#sizeSelect").change(function() {
		changePuzzles();
	});
	$("#puzzleSelect").change(function() {
		$("#generatedPuzzle").val("");
		$("#userPuzzle").val("");
		$("#userSolvePuzzle").val("");
		puzzle = $("#puzzleSelect option:selected").val()
		display(puzzle);
	});
	$("#numberCanvas").bind("contextmenu", function(e){
		e.preventDefault();
		//handleClick(e);
	})

	if(isMobile == true){
		$("#genWidthField").val("8");
		$("#genHeightField").val("12");
		$("#codeDiv").css("display", "none");
		$("#solveCodeDiv").css("display", "none");
	}
	canvas = document.getElementById("inputCanvas");
	context = canvas.getContext("2d");

	puzzleCanvas = document.getElementById("puzzleCanvas");
	puzzleContext = puzzleCanvas.getContext("2d");

	numberCanvas = document.getElementById("numberCanvas");
	numberContext = numberCanvas.getContext("2d");
	display("7x7m2:2a2b2g2a3c3a1a2a1a3i2b2b4d3");
	//what
	//6x6:2aa4a2aaaaaa3aa5a3aaaaaaaaaaaa1aa1a1

	//7x7m2:a4b3a3i2c51g4a6a2e1a22b4a1a
	//15x15m2:a2i3a2a4f4b2r1b1a2a1b1o1f3a4b4a4a2b25l6c4b5e3w1e1t5j6d2b3c3a1d2d2a1a2a4a3i5c3
	//15x15m2:4a5c2d2b2c3c4a5c2f2d2a5a44j1r2b3a4a3d2q2a6d2h2m1j3b5ze3o4b2j2e4a6d3
	//15x15m2:3a3a4e5a3a3t3a2d1a2t2j2b3b2d3a1r1f7a6a5p4h5b1a4k2a4k2a4p2o4h5b4a
	//15x15m2:a4d5f2c2b1h2h3c3d5b4c1a1q3b1m5c5e3b2b2a2h1r1k2a1c3i2c3d4a5q32b1a1b1b2g3a5b4b3a3
	//15x15m2:a3l1b2o1d3a4c3b3c2p1g3d4c6c6h1c2b3a4b2w3b3c5a4g2b4i3p1m2g1g3b6e5a6a4
	//15x15m2:a3l21b2l3l2r4h3g2d1d2f1d3c3a7a5h2zc2a2c4g2q4a6a5f5a5o3d3a2d6a3
	//15x15m2:4c3b1e3c1k1e3g6o3f2b3a1u1a3c3e6a3a4f4a3b2a2a2h54o2b5i3o3c5a4g2p1d3f1a
	//10x10m2:4a5a3a4a2h2a3j4e4b3b4m4a1c2g3c3a3a1k1a3f3

	//medium
	//15x15m2:1a4a3c3c4a2s3d4a3b34a7g2g1g2c2a4i6a4f1d2a1a1c3b5a1b2g1i2l3f2a4b1d46a3f4v1i23a6h5a3a
	//10x14:2a3aa3a2aaa1a2aa3aa33a2a4aaa2aa3a1aaaaa33a3a5a3a4aaaaaaaa1a2a2aa3a3a2a2a3aaaa3a2a2a3a3aa2a3a3a2a3aa4a1a2a2aaaaaa1aaa3a2a1aaaa3a2aaa2a3aa2aa3
	//10x14:2a3a4a2aa3aaa1a2aa2a3a1aaaaaa4aaaa3a2a4a4a2aa3a2a3aaa2aa3aaa1a2a1aaa2aaaa3a4a3a32a3a2a5a3aaaaaa1aaa32aa1aaaa3aaa1a3a3aa33aa4a3aa2aa1aa3aa3a2
	//hard
	//10x14:a3aa4aa4a32aaaaa1a2aa3a2aaa1a35a2a4a4a4aa2a3aaaaa34a2aa3a2aaa3a3aaaaa23aaa2a1a4aa2aaa4a3a23aa2aaaaaaa1aaa2aa2a4aa3aaa3a3aaaaa1aaaa3a3a4aa3a2
	//10x14:2a2a4a1aa1aaaaaaaaaa4aa1aa3aa2aaaaaaaaaa2a4a8a6aa1aaaaaaaaaa2a3a4a3aa2aaaaa1aaaaa2aa3a3a2a2a1aa4a2a4a3aa2aaaaa1aa2a4aa2aaaaa1a2aa3a2a4a3a2aa
	//10x14:2aa5a3a3a3aaaa2a3a3a2aa4a2a1aaaaaaaaaaa33a3a3aaa3aa2aaaa1aaa2aaa3aa2a4aa2aaa4a2aa3aa2aaaaa3aaaaaa2a5aa3a5a3aaa2aaaa1aa2aaa1aaaaaa2a2aa4a3a3a
	//10x14:1a2a3aa3a3aaaaa1aaaa4a2a3a2a3aaaaaa2a1a33a3a4aaa2aaaa1a3a2aaaa2a1aaaa33aa3a3aa3aaaaaaaaaa3aa1a2a2a3a3aa2a3a1a4aaaa1a1a3a2aa1a2a1a2a1aa3a3a3a
	//41x27:4a3a2a6a3aa1a3aaaa2a3aa5a5aa3aaa4a3a2a1a1aaaaaaaaaaaaaaaaaaaaaaaa2a1aaa2aaaa2a3a2a3a4aaa3a4a3aa3aaaa5a4aa2aaaa1aaaaaaa2aaa2aaaa3aa3a4aa3aaa2aaaaaaa3a4aa1aa3aa3a1a2a2a1aaaaaaaa1aaa2aaaa3a3aa1a2aa8aa2aa3a1a1aaaa4aaaaaaaaaaa4a3aaaaa3a3aaaaaaaaaa3a2aa3a3a2a3a4a3aaa4a2a3a2a1a4a4aa5aa4a3aa2a43aaaaa2a3a4aa3aaaaaa1a4a2aaaa1aaaa3a2aaaaa2a1a3aaa2aaaaaaa2a3a2aaa3aa2a3aa5aaa3aa42a1a3a1aaaa3a2aa2a2aaaaaaaaaa2a3aaaaaaaaaa3a3a4a4a4aa2aa4a3a3a2a2aa3a4a3aaa3a4a2a43aaa3a3aaaa2a2aa1aaa3a3aa3aaa3a4a5a4a1aaaaa2aaaa4aa3aaaaaa3a3aaaaaaaaaa3aaaaaaaaaa3aaa1aaa3aaa2a3a2aaa2aa4a4a1aaaaa1aaa4aa3aa3aaa4aa3a4aaa1a2a3aa2a1a3aa2a3aa3a4aa1a6aa4aaa3aa1aaa3aaa4a3aa3aaa2aa4a2aa2a1aaaaaaa2a4aa2a4a3aa2aaaaaaaa1aa2aa4aa2a5aa3aa1a4a1a2aaaaaa1aa4aaaa3a3a3aa3aa3aa4aaaa32aaaaa4a6a2aaaaaaaa2aaa3a4a4aaaaaaaa2a2aaa3a3a3aaa1a3a2aa3aaa2a3aaaaaaaaa2aaaaaa1aaa2a3a3a5aaa2aa2aaaaaaa2aaaaa3a3aaa1aa1a2a2aaa2a2aa2aaaaaa3a3aa3aa3a4aa2a4aaa3aaaa2aaa5a3a1aa1a1aa5aaa3aaa2a3aaaaaa3a3a2a2aa3aaa3a4aa4a2aaaaaa1aa3aa3a4aa3a1aaa1a5a4aaaaaaaaaaaaa3a3a2aa3aaaaa2aaaa1a6a6a2aaaaaa2a4a4a2a1aaaa4a2aa2a4a3a3a1aaaaaaaaaa1a4aa4a5aaa3a1a2aaaaa4aaaaa5aaa4aa4aaaa2aa
	//15x15m2:3j3a3b2a6c4d2a2d2a3f3q3a6c4d4a4h1a3za4a5c2r5b1i2u2i3b1i1c3a4b2d3k5a3
	//15x15m2:a2k2c1d4c1c2i2b3b3e5f23a3a3c2d2j3a2zb2m2d1b3t2a3f3a5b4c5a3q2c1a2a2a3c3l3a
	//15x15m2:3d4g2i1a3c4a2c3e2a1q3e3f4c1a3d2l1b2b4c3a6q4a7c4c1l4c4a2b1l1g6l42o2b1a3g3
	//25x25m2:4a5c5c4h3d3d2zb2a3a1b3d4b4r2o1a3a3a1n6a7h4zl2b1a2a3a5a7a7a1m2a3a2p2h1c2n3d7b6c2r1j3zc3zzn2a4zm3f4b3e3za2c2a3a2c1g1v5c4c3a2m2k1z1k2e4a2a1a5b2d3b4a
	//50x50:a1a3a4aa4a3a4aa4a4aaa4a3a3aa5a4a4a3a4a5a5aa4a6aa2a4a4a3a1aa2a3aa5a4aa1aa3a4a4aa2a2aaaaaaaaaa4a2a2aa4a1a3a4aa6a3aaaaaaaaaaaaaaaa1aa4aaaa3aa6aaaa2a6a2aa6a4a4a2aaaaa2a6a6a3a3a4a2aaa3aaa6a4aaaaa6a6a4a3a4aa1a3a3aa3aa4a5a3aaa3a3a3aa4aa4a4aaaaaaaaaaaaa2a4aa4a3a4aa2aa4aaaaaa4aa4a3aa2a2aa4aaaa5aa6a8a3aaaaaa3a2a5aa4aa3aaa4aaaaa4a5aa2a4a3aaa3a3aaaaaaaaa2a1a2a3a1aa2aa3aa4aaa4a5aaaaaaaaaaa3aaaaa4aa5a7a5aa3a6a5aaaaaaaaaa3aa4aaaaa5a4a3aa8a5aa6aa6a3aaaaaa3aaaa2a3aa3aa6a5aa2aaaaaaaaaaaaaaaaaa4a2aa1aa4a7a5a2a5aa6aaaaaaaaaa4aa7a8a6a5a4aa3a4a5aaaaa3aaaaaaaaaaaa1aa6a3a2aaaa1aaaaaaaaaaaaaaaaaaa2a3aaaa5a4a2aa3aa5aa3aaaaaa5a6a3aa4a8aa3aa5aa5aa3aa4aaaa3aaaaaa2a1aa3aa6aa2aaaaaaaaaaaa4aaa3aa4a2aaa3aa5a4a2aaa3aa4a2aaaaaaaaaaa1a3a4a4a4a4a5a3aa3a1a4a4aa1a3aa3aa2aa1aa5a54aaa4a6aaaaa3a2a2aaaaaa2a1a3a3aa3a5a4aa2aa2aaa5aaaaa2aa1aa3a3aa3a5a6a3aaaa3aaa4aa2a3a1a1aa2aa2a3a4a6a2aaaaaaa1aa3a3a3a3aa6a3aaa2a2aa2a2aaaaaaaaaaa4aaa2a4a4a6a4aa3aaaaaaaaaaaaa1aa3a3aaaaa2aa2aa3aa4a4a5a4aaaaaaaa1aa4aa6aa4a3aa3aaaa3a2a4a3aa3aa3a1aa4aaa3a4aaa3aaaaa3aa1a2aaaaaaa5a5aa2a2aaaaaaaaaaaaaa4a5a4aa1aaa4a3aaa2a2aa3a1a4aaaaa4a3aa2a2a5aa6aa3a4a2a3a4aaa3aa2a5a2a2a5aa2a1a3aaa2a3a1aaaaaa1aaa3a4a3a3a3aaaaaaaa2a2aaaaaa2aaa3a3a3a3a6a5a2a3aaa3aa4a3a1a2aaa3aaa2aa3aa5a1a2a4aaaaaaa1a3a1a4a2aa2aaa4a6a5a3aa1aaa2aaa3aa1a1a6a2aa2a4aa5a5a2a1a2a4aaa2aaaaaaaa2aaaaaa1a2a2aa3a2aaaaaa3a2aaaaaa2a5a2aa2aaa4a8a7a5a4aa4a6a4a4aa4a3a4aa3a3a4aaa2a3aa1a1a4aaa4aaaaaa2a2aa3a2a2a6aa5a3a4a2aa1a5a3aaaaaaaaaaaaa1aaa3a5a2a4a3aaaaaaaaaaaaaaa4aa5a1a3aa3a2a2aa4aa5aaa5aa2a2a3a3aa3aa5aa5aa6a3aaaaaa2a6aaaa4a6aa3a3aaa3aaa3a3a2a4a3aaa2a2aa2aaaaa4a1a6a1aa4a3a1a1aa3a3a2a2a3a3a2a3a5a2a2a2aa2a3a3a1a4a3aaaa2aaa2a7aa3a3a4a3a3a2a2a1a2a3a3a4a5aa3a6a4a6a4aa2a6a4aaaaaa2a5a1a2a2a2aaaaa3a3aaaaaaaaaaaaaaaaaaa6a4a3aa3a2aaaaa2a4a2a1aa4a3aa3aa1aa3aaa3aa5a5a6a4aaaaaa3aa2a6aa1aa1a2aaaaaaaaaaaa3a3aaa3aa3aa4aaaaa3aaa4aaa2aaaaaaa1a2aa3a3a8a4a1aaaaaaaaaaaaaaa3aaa3a5a5aa3aa4a8a3a4a4a5aa2a4a2a3a43a3a2aa3a3a4a4aa1aa4aaa3aaa3aaa1a4a3a2a3aaaa5a3a1aa2a2a2aa3a3a4a5aaa4aaa3a3aaa4a7a1aaa2a2a4aa4a1a2a4aa2a2aa2a3a2a3a5a2aa2aa2a5a6aaaaaaa2a1aaa2aa7a5a1a3aa2a2aa3a3a3aaaaaa4aa5a1aaa3a5aa3aa5aa6aa1aaaa4a5aa2a3aa3a3a4a6a6aa7aa4aaaaaaaaa1aaa2aaaa1aaa7a5a1aa4aaaa1a2a3a3a4a3aaa1aa3a5a5aa4aa3aa2aa3a2a1aaa2a32aa3a4a5a2a2a1aaaaaaa2aaaaaaaaaa3aa3a2aa3a4a6a5a3aaa1aaaaa1a3a4a4a6a7a7a7aaa5a4a2aa2aa4a4aaaaaa3a2a4a3a2aaa5aaa2aaaaaaaaaaaa2aa1a2aa6aa6a6a4a6a4aa3a1a4a4aa2aaa3aa4aa3aa6a4aaaaa2a4aa2aaaaaaaaaa2aa3a2aaaaaaaaaaaaaaaaaaaaaaaa3a6aa4aa2a4aa5a5a4a4a1aa3aa43a4a3aa3a6aa6aa5aa6a5aa4aa4a4aa3a3aa3a2a3a4aa2aa1a
}


function save(){
	var solution = "";
	for (x = 0;x < (height + (height+1));x++) {
		for (y = 0;y < (width + (width+1));y++) {
			solution += puzzleState[x][y] + ",";
		}
	}
	solution = solution.substring(0, solution.length - 1);
	localStorage.removeItem("savedHashiPuzzle");
	localStorage.removeItem("savedHashiProgress");
	localStorage.setItem("savedHashiPuzzle", puzzle);
	localStorage.setItem("savedHashiProgress", solution);
	$("#canvasDiv").css("box-shadow", "1px 1px 5px 2px " + correctColor);
}
function load(){
	var savedPuzzle = localStorage.getItem("savedHashiPuzzle");
	if(savedPuzzle){
		editMode = false;
		//$("#guessButton").val("Guess Mode: OFF");
		$("#clearButton").val("Clear All");
		puzzle = savedPuzzle;
		display(savedPuzzle);
		$("#canvasDiv").css("box-shadow", "1px 1px 5px 2px " + correctColor);
		var savedProgress = localStorage.getItem("savedHashiProgress");
		var progress = savedProgress.split(",");

		var z = 0;
		for (x = 0;x < (height + (height+1));x++) {
			for (y = 0;y < (width + (width+1));y++) {
				if(progress[z] == "line"){
					puzzleState[x][y] = "line";
					if (y % 2 != 0 && x % 2 == 0) {
						//vertical
						drawLine(x, y, inputColor, "v", "line");
					}else if(x % 2 != 0 && y % 2 == 0) {
						//horizontal
						drawLine(x, y, inputColor, "h", "line");
					}
				}else if(progress[z] == "2line"){
					puzzleState[x][y] = "2line";
					if (y % 2 != 0 && x % 2 == 0) {
						//vertical
						drawLine(x, y, inputColor, "v", "2line");
					}else if(x % 2 != 0 && y % 2 == 0) {
						//horizontal
						drawLine(x, y, inputColor, "h", "2line");
					}
				}
				z++;
			}
		}
		modifyRemainingLines(x, y, "all", false);
		calculateSolutionLines();
		checkSolution();
	}else{
		$("#canvasDiv").css("box-shadow", "1px 1px 5px 2px " + incorrectColor);
	}
}
function display(displayPuzzle) {
	numberCount = 0;
	moveArray = new Array();
	//fixedArray = new Array();
	//fixed = false;
	activeNumber = "none";
	startNumber = "-";
	drawnLine = false;
	accessibleNumbers = {};
	remainingLines = {};
	lines = new Array();
	movesArray = new Array();
	finishedNumbers = new Array();
	invalidNumbers = new Array();

	$("#guessButton").val("Guess Mode: OFF");
	$("#clearButton").val("Clear All");
	$("#canvasDiv").css("box-shadow", "1px 1px 5px 2px #888888");


	puzzle = displayPuzzle;
	var regex = /[0-9]*x[0-9]*/;
	var size = puzzle.split(":");
	var wxh = size[0].split("x");
	var temp = wxh[1].split("m");
	var numBridges = temp[1];
	height = parseInt(temp[0]);
	width = parseInt(wxh[0]);
	//console.log(height);
	//console.log(width);

	var puzzData = puzzle.split(":");
	puzzData = puzzData[1];

	//console.log(puzzData);
	//var regex2 = /[^0-1a-z]/
	//var error = regex2.exec(puzzData);
	var error = null;
	if (error != null) {

		alert("invalid puzzle");
	}else{
		puzzleState = new Array((height * 2) + 1);
		for(var i = 0;i < ((height * 2) + 1);i++){
			puzzleState[i] = new Array((width * 2) + 1);
		}
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if((y % 2 != 0) && (x % 2 != 0)){
					puzzleState[x][y] = "-";
				}else if(y % 2 != 0 && x % 2 == 0) {
					puzzleState[x][y] = "noline";
				}else if(x % 2 != 0 && y % 2 == 0) {
					puzzleState[x][y] = "noline";
				}else{
					puzzleState[x][y] = "dot";
				}
			}
		}
		formattedPuzzle = puzzle.split(":");
		formattedPuzzle = formattedPuzzle[1];

		formattedPuzzle = formattedPuzzle.replace(/a/g, "-");
		formattedPuzzle = formattedPuzzle.replace(/b/g, "--");
		formattedPuzzle = formattedPuzzle.replace(/c/g, "---");
		formattedPuzzle = formattedPuzzle.replace(/d/g, "----");
		formattedPuzzle = formattedPuzzle.replace(/e/g, "-----");
		formattedPuzzle = formattedPuzzle.replace(/f/g, "------");
		formattedPuzzle = formattedPuzzle.replace(/g/g, "-------");
		formattedPuzzle = formattedPuzzle.replace(/h/g, "--------");
		formattedPuzzle = formattedPuzzle.replace(/i/g, "---------");
		formattedPuzzle = formattedPuzzle.replace(/j/g, "----------");
		formattedPuzzle = formattedPuzzle.replace(/k/g, "-----------");
		formattedPuzzle = formattedPuzzle.replace(/l/g, "------------");
		formattedPuzzle = formattedPuzzle.replace(/m/g, "-------------");
		formattedPuzzle = formattedPuzzle.replace(/n/g, "--------------");
		formattedPuzzle = formattedPuzzle.replace(/o/g, "---------------");
		formattedPuzzle = formattedPuzzle.replace(/p/g, "----------------");
		formattedPuzzle = formattedPuzzle.replace(/q/g, "-----------------");
		formattedPuzzle = formattedPuzzle.replace(/r/g, "------------------");
		formattedPuzzle = formattedPuzzle.replace(/s/g, "-------------------");
		formattedPuzzle = formattedPuzzle.replace(/t/g, "--------------------");
		formattedPuzzle = formattedPuzzle.replace(/u/g, "---------------------");
		formattedPuzzle = formattedPuzzle.replace(/v/g, "----------------------");
		formattedPuzzle = formattedPuzzle.replace(/w/g, "-----------------------");
		formattedPuzzle = formattedPuzzle.replace(/x/g, "------------------------");
		formattedPuzzle = formattedPuzzle.replace(/y/g, "-------------------------");
		formattedPuzzle = formattedPuzzle.replace(/z/g, "--------------------------");
		puzzData2 = formattedPuzzle.split("");

		var z = 0;
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if ((y % 2 != 0) && (x % 2 != 0)){
					if(z < puzzData2.length){
						puzzleState[x][y] = puzzData2[z];
						if(puzzData2[z] != "-"){
							numberCount++;
						}
					}
					z++;
				}
			}
		}
		//handles canvas that underlays input showing puzzle

		puzzleCanvas.height = (height * gridSize) + (padding * 2);
		puzzleCanvas.width = (width * gridSize) + (padding * 2);
		puzzleContext.fillStyle = backgroundColor;
		puzzleContext.fillRect(0, 0, puzzleCanvas.width, puzzleCanvas.height)
		puzzleContext.textAlign = "center";

		numberCanvas.height = (height * gridSize) + (padding * 2);
		numberCanvas.width = (width * gridSize) + (padding * 2);
		numberContext.textAlign = "center";
		//canvas padding
		var drawX = padding;
		var drawY = padding;
		canvas.height = (height * gridSize) + (padding * 2);
		canvas.width = (width * gridSize) + (padding * 2);
		//context.fillStyle = backgroundColor;
		//context.fillRect(0, 0, canvas.width, canvas.height)
		context.textAlign = "center";
		for (x=1;x <= (height);x++) {
			for (y=1;y <= (width);y++) {
				//console.log(puzzleState[x][y]);
			}
		}
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if ((y % 2 != 0) && (x % 2 != 0)){
					//console.log(puzzleState[x][y]);
					if(puzzleState[x][y] == "-"){
						puzzleContext.fillStyle = gridColor;
						puzzleContext.fillRect(drawX, drawY, gridSize, gridSize);
						puzzleContext.fillStyle = backgroundColor;
						puzzleContext.fillRect(drawX + gridSize * .02, drawY + gridSize * .02, gridSize - (gridSize * .04), gridSize - (gridSize * .04));
						drawX += gridSize;
					}else{
						puzzleContext.fillStyle = gridColor;
						puzzleContext.fillRect(drawX, drawY, gridSize, gridSize);
						puzzleContext.fillStyle = backgroundColor;
						puzzleContext.fillRect(drawX + gridSize * .02, drawY + gridSize * .02, gridSize - (gridSize * .04), gridSize - (gridSize * .04));
						drawX += gridSize;
						drawNumber(puzzleState[x][y], numberColor, circleColor, x, y);
						remainingLines[x + "-" + y] = puzzleState[x][y] * 1;
					}
				}
			}
			if ((y % 2 != 0) && (x % 2 != 0)){
				drawX = padding;
				drawY += gridSize * zoom;
			}
		}
	}
	calculateAccessibleNumbers();
	console.log(remainingLines);
}

function calculateAccessibleNumbers(){
	for (x = 0;x < (height + (height + 1));x++) {
		for (y = 0;y < (width + (width + 1));y++) {
			if ((y % 2 != 0) && (x % 2 != 0)){
				if(puzzleState[x][y] != "-"){

					accessibleNumbers[x + "-" + y] = new Array();
					var foundNumber = false;
					for(i = x;i < (height + (height + 1));i += 2) {
						if(foundNumber == false && (i + "-" + y) != (x + "-" + y)){
							if(puzzleState[i][y] != "-"){
								accessibleNumbers[x + "-" + y].push(i + "-" + y);
								foundNumber = true;
							}
						}
					}
					foundNumber = false;
					for(i = x;i > 0;i-=2) {
						if(foundNumber == false && (i + "-" + y) != (x + "-" + y)){
							if(puzzleState[i][y] != "-"){
								accessibleNumbers[x + "-" + y].push(i + "-" + y);
								foundNumber = true;
							}
						}
					}
					foundNumber = false;
					for(i = y;i < (width + (width + 1));i += 2) {
						if(foundNumber == false && (x + "-" + i) != (x + "-" + y)){
							if(puzzleState[x][i] != "-"){
								accessibleNumbers[x + "-" + y].push(x + "-" + i);
								foundNumber = true;
							}
						}
					}
					foundNumber = false;
					for(i = y;i > 0;i-=2) {
						if(foundNumber == false && (x + "-" + i) != (x + "-" + y)){
							if(puzzleState[x][i] != "-"){
								accessibleNumbers[x + "-" + y].push(x + "-" + i);
								foundNumber = true;
							}
						}
					}
				}
			}
		}
	}
	//console.log(accessibleNumbers);
}
function modifyRemainingLines(x, y, type, undo){
	//console.log(x + "-" + y + "-" + type);
	//console.log(type);
	if(type != "all"){
		if(undo == false){
			if(type == "noline"){
				remainingLines[x + "-" + y]+= 2;
			}else if(type == "line"){
				remainingLines[x + "-" + y]--;
			}else if(type == "2line"){
				remainingLines[x + "-" + y]--;
			}
		}else{
			if(type == "noline"){
				remainingLines[x + "-" + y]++;
			}else if(type == "line"){
				remainingLines[x + "-" + y]++;
			}else if(type == "2line"){
				remainingLines[x + "-" + y]-= 2;
			}
		}
		//console.log(remainingLines[x + "-" + y]);
		if(remainingLines[x + "-" + y] == 0){
			drawNumber(puzzleState[x][y], numberColor, correctColor, x, y);
			if(finishedNumbers.indexOf(x + "-" + y) == -1){
				finishedNumbers.push(x + "-" + y);
			}
			if(invalidNumbers.indexOf(x + "-" + y) != -1){
				invalidNumbers.splice(invalidNumbers.indexOf(x + "-" + y), 1);
			}
		}else if(remainingLines[x + "-" + y] < 0){
			//console.log(remainingLines[x + "-" + y]);
			drawNumber(puzzleState[x][y], numberColor, incorrectColor, x, y);
			if(invalidNumbers.indexOf(x + "-" + y) == -1){
				invalidNumbers.push(x + "-" + y);
			}
			if(finishedNumbers.indexOf(x + "-" + y) == -1){
				finishedNumbers.push(x + "-" + y);
			}
		}else{
			var index = finishedNumbers.indexOf(x + "-" + y);
			if(finishedNumbers.indexOf(x + "-" + y) != -1){
				finishedNumbers.splice(index, 1);
				drawNumber(puzzleState[x][y], numberColor, circleColor, x, y);
			}
		}
	}else{
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if ((y % 2 != 0) && (x % 2 != 0)){
					if(puzzleState[x][y] != "-"){
						var lineCount = 0;
						if(puzzleState[x + 1][y] == "line"){
							lineCount++;
						}else if(puzzleState[x + 1][y] == "2line"){
							lineCount+=2;
						}
						if(puzzleState[x - 1][y] == "line"){
							lineCount++;
						}else if(puzzleState[x - 1][y] == "2line"){
							lineCount+=2;
						}
						if(puzzleState[x][y + 1] == "line"){
							lineCount++;
						}else if(puzzleState[x][y + 1] == "2line"){
							lineCount+=2;
						}
						if(puzzleState[x][y - 1] == "line"){
							lineCount++;
						}else if(puzzleState[x][y - 1] == "2line"){
							lineCount+=2;
						}
						var remaining = (puzzleState[x][y] * 1) - lineCount;
						remainingLines[x + "-" + y] = remaining;
						if(remainingLines[x + "-" + y] == 0){
							drawNumber(puzzleState[x][y], numberColor, correctColor, x, y);
							if(finishedNumbers.indexOf(x + "-" + y) == -1){
								finishedNumbers.push(x + "-" + y);
							}
							if(invalidNumbers.indexOf(x + "-" + y) != -1){
								invalidNumbers.splice(invalidNumbers.indexOf(x + "-" + y), 1);
							}
						}else if(remainingLines[x + "-" + y] < 0){
							drawNumber(puzzleState[x][y], numberColor, incorrectColor, x, y);
							if(invalidNumbers.indexOf(x + "-" + y) == -1){
								invalidNumbers.push(x + "-" + y);
							}
							if(finishedNumbers.indexOf(x + "-" + y) == -1){
								finishedNumbers.push(x + "-" + y);
							}
						}else{
							var index = finishedNumbers.indexOf(x + "-" + y);
							if(finishedNumbers.indexOf(x + "-" + y) != -1){
								finishedNumbers.splice(index, 1);
								drawNumber(puzzleState[x][y], numberColor, circleColor, x, y);
							}
						}
					}
				}
			}
		}
		//console.log(remainingLines);
	}
}
function calculateSolutionLines(){
	console.log(puzzleState);
	for (x = 0;x < (height + (height + 1));x++) {
		for (y = 0;y < (width + (width + 1));y++) {
			var endCircle = "";
			if ((y % 2 != 0) && (x % 2 != 0)){
				if(puzzleState[x][y] != "-"){
					if(puzzleState[x + 1][y] == "line" || puzzleState[x + 1][y] == "2line"){
						while(endCircle == ""){
							for(i = (x + 2);i < (height + (height + 1));i += 2) {
								if(puzzleState[i][y] != "-"){
									//foundEnd = true;
									endCircle = i + "-" + y;
									break;
								}
							}
							if(endCircle == ""){
								endCircle = "error";
							}
						}
						if(endCircle == "error"){

						}else{
							var startX = x;
							var startY = y;
							var temp = endCircle.split("-");
							var destinationX = temp[0] * 1;
							var destinationY = temp[1] * 1;
							if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) == -1 && lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) == -1){
								lines.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY)
							}
						}
					}
					endCircle = "";
					if(puzzleState[x][y + 1] == "line" || puzzleState[x][y + 1] == "2line"){
						while(endCircle == ""){
							for(i = (y + 2);i < (width + (width + 1));i += 2) {
								if(puzzleState[x][i] != "-"){
									//foundEnd = true;
									endCircle = x + "-" + i;
									break;
								}
							}
							if(endCircle == ""){
								endCircle = "error";
							}
						}
						if(endCircle == "error"){

						}else{
							var startX = x;
							var startY = y;
							var temp = endCircle.split("-");
							var destinationX = temp[0] * 1;
							var destinationY = temp[1] * 1;
							if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) == -1 && lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) == -1){
								lines.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY)
							}
						}
					}
					endCircle = "";
				}
			}
		}
	}
	//console.log(lines);
}
function undo(){
	if(movesArray.length > 0){
		resetLines();
		var color = inputColor;
		var moveData = movesArray[movesArray.length - 1].split("/");
		movesArray.splice(movesArray.length - 1, 1);
		var temp = moveData[0].split("-");
		var startX = temp[0] * 1;
		var startY = temp[1] * 1;
		temp = moveData[1].split("-");
		var destinationX = temp[0] * 1;
		var destinationY = temp[1] * 1;
		var type;
		if(moveData[2] == "noline"){
			type = "2line";
		}else if(moveData[2] == "2line"){
			type = "line";
		}else if(moveData[2] == "line"){
			type = "noline";
		}
		if(startX > destinationX){
			for(i = startX - 1;i > destinationX;i -= 2) {
				//console.log("WHY");
				puzzleState[i][startY] = type;
				drawLine(i, startY, color, "v", type);
			}
		}else if(startX < destinationX){
			for(i = startX + 1;i < destinationX;i += 2) {
				//console.log("WHY");
				puzzleState[i][startY] = type;
				drawLine(i, startY, color, "v", type);
			}
		}else if(startY > destinationY){
			for(i = startY - 1;i > destinationY;i -= 2) {
				//console.log("WHY");
				puzzleState[startX][i] = type;
				drawLine(startX, i, color, "h", type);
			}
		}else if(startY < destinationY){
			for(i = startY + 1;i < destinationY;i += 2) {
				//console.log("WHY");
				puzzleState[startX][i] = type;
				drawLine(startX, i, color, "h", type);
			}
		}
		if(type != "noline"){
			if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) == -1 && lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) == -1){
				lines.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY)
			}
		}else{
			if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) != -1){
				lines.splice(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY), 1);
			}
			if(lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) != -1){
				lines.splice(lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY), 1);
			}
		}
		modifyRemainingLines(startX, startY, type, true);
		modifyRemainingLines(destinationX, destinationY, type, true);
	}

}
function drawConnectingLine(x, y, startX, startY, color, redraw){
	console.log(x + "-" + y + " " + startX + "-" + startY);
	var type = "line";
	//var temp = startCell.split("-");
	//var startX = temp[0] * 1;
	//var startY = temp[1] * 1;
	startX = startX * 1;
	startY = startY * 1;
	var destinationX = x * 1;
	var destinationY = y * 1;
	if(startX > destinationX){
		if(puzzleState[startX - 1][startY] == "noline"){
			type = "line";
		}else if(puzzleState[startX - 1][startY] == "line"){
			type = "2line"
		}else if(puzzleState[startX - 1][startY] == "2line"){
			type = "noline"
		}
		if(redraw == true){
			type = puzzleState[startX - 1][startY];
		}
		for(i = startX - 1;i > destinationX;i -= 2) {
			//console.log("WHY");
			puzzleState[i][startY] = type;
			drawLine(i, startY, color, "v", type);
		}
		if(redraw == false){
			movesArray.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY + "/" + type);
		}
	}else if(startX < destinationX){

		if(puzzleState[startX + 1][startY] == "noline"){
			type = "line";
		}else if(puzzleState[startX + 1][startY] == "line"){
			type = "2line"
		}else if(puzzleState[startX + 1][startY] == "2line"){
			type = "noline"
		}
		if(redraw == true){
			type = puzzleState[startX + 1][startY];
		}
		for(i = startX + 1;i < destinationX;i += 2) {
			//console.log("WHY");
			puzzleState[i][startY] = type;
			drawLine(i, startY, color, "v", type);
		}
		if(redraw == false){
			movesArray.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY + "/" + type);
		}
	}else if(startY > destinationY){

		if(puzzleState[startX][startY - 1] == "noline"){
			type = "line";
		}else if(puzzleState[startX][startY - 1] == "line"){
			type = "2line"
		}else if(puzzleState[startX][startY - 1] == "2line"){
			type = "noline"
		}
		if(redraw == true){
			type = puzzleState[startX][startY - 1];
		}
		for(i = startY - 1;i > destinationY;i -= 2) {
			//console.log("WHY");
			puzzleState[startX][i] = type;
			drawLine(startX, i, color, "h", type);
		}
		if(redraw == false){
			movesArray.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY + "/" + type);
		}
	}else if(startY < destinationY){

		if(puzzleState[startX][startY + 1] == "noline"){
			type = "line";
		}else if(puzzleState[startX][startY + 1] == "line"){
			type = "2line"
		}else if(puzzleState[startX][startY + 1] == "2line"){
			type = "noline"
		}
		if(redraw == true){
			type = puzzleState[startX][startY + 1];
		}
		for(i = startY + 1;i < destinationY;i += 2) {
			//console.log("WHY");
			puzzleState[startX][i] = type;
			drawLine(startX, i, color, "h", type);

		}
		if(redraw == false){
			movesArray.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY + "/" + type);
		}
	}
	if(redraw == false){
		if(type != "noline"){
			if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) == -1 && lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) == -1){
				lines.push(startX + "-" + startY + "/" + destinationX + "-" + destinationY)
			}
		}else{
			if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) != -1){
				lines.splice(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY), 1);
			}
			if(lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) != -1){
				lines.splice(lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY), 1);
			}
		}
		modifyRemainingLines(startX, startY, type, false);
		modifyRemainingLines(destinationX, destinationY, type, false);

	}else{
		//console.log("lol");
	}
	//console.log(lines);
	//console.log(movesArray);
}
function drawLine(vertCell, horCell, color, direction, type){
	vertCell = vertCell * 1;
	horCell = horCell * 1;
	context.fillStyle = color;
	if(direction == "h"){
		if(type == "line"){
			drawY = (((vertCell / 2)) * gridSize) - ((lineSize / 2)) + padding - lineSize;
			drawX = (((horCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			context.clearRect(drawX, drawY, gridSize, lineSize * 3);

			drawY = (((vertCell / 2)) * gridSize) - ((lineSize / 2)) + padding;
			drawX = (((horCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			context.fillRect(drawX, drawY, gridSize, lineSize);
		}else if(type == "2line"){
			//console.log("FUCK");
			drawY = (((vertCell / 2)) * gridSize) - ((lineSize / 2)) + padding;
			drawX = (((horCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			context.clearRect(drawX, drawY, gridSize, lineSize * 3);

			drawY = (((vertCell / 2)) * gridSize) - ((lineSize / 2)) + padding - lineSize;
			context.fillRect(drawX, drawY, gridSize, lineSize);
			drawY = (((vertCell / 2)) * gridSize) - ((lineSize / 2)) + padding + lineSize;
			context.fillRect(drawX, drawY, gridSize, lineSize);
		}else if(type == "noline"){
			drawY = (((vertCell / 2)) * gridSize) - ((lineSize / 2)) + padding - lineSize;
			drawX = (((horCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			context.clearRect(drawX, drawY, gridSize, lineSize * 3);
		}
	}else if(direction == "v"){
		if(type == "line"){
			drawY = (((vertCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			drawX = (((horCell / 2)) * gridSize) - ((lineSize / 2)) + padding - lineSize;
			context.clearRect(drawX, drawY, lineSize * 3, gridSize);

			drawY = (((vertCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			drawX = (((horCell / 2)) * gridSize) - ((lineSize / 2)) + padding;
			context.fillRect(drawX, drawY, lineSize, gridSize);

		}else if(type == "2line"){
			drawY = (((vertCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			drawX = (((horCell / 2)) * gridSize) - ((lineSize / 2)) + padding;
			context.clearRect(drawX, drawY, lineSize, gridSize);

			drawX = (((horCell / 2)) * gridSize) - ((lineSize / 2)) + padding - lineSize;
			context.fillRect(drawX, drawY, lineSize, gridSize);
			drawX = (((horCell / 2)) * gridSize) - ((lineSize / 2)) + padding + lineSize;
			context.fillRect(drawX, drawY, lineSize, gridSize);
		}else if(type == "noline"){
			drawY = (((vertCell / 2)) * gridSize) - ((gridSize / 2)) + padding;
			drawX = (((horCell / 2)) * gridSize) - ((lineSize / 2)) + padding - lineSize;
			context.clearRect(drawX, drawY, lineSize * 3, gridSize);
		}
	}
}
function drawXLine(vertCell, horCell, color, direction){
	//console.log("what");
	context.lineWidth = 1 * zoom;
	context.strokeStyle = color;
	if(direction == "h"){
		var drawY = (((vertCell / 2)) * gridSize * zoom) - (lineSize / 2) + padding;
		var drawX = (((horCell / 2)) * gridSize * zoom) - (gridSize / 2) + padding;
		drawLine(vertCell, horCell, backgroundColor, direction);
		context.beginPath();
		context.moveTo(drawX + (1 + 15) * zoom, drawY + 1 * zoom);
		context.lineTo(drawX + (gridSize - 15 - 1) * zoom, drawY + (lineSize - 1) * zoom);
		context.moveTo(drawX + (1 + 23) * zoom, drawY + 1 * zoom);
		context.lineTo(drawX + (gridSize - 23 - 1) * zoom, drawY + (lineSize - 1) * zoom);
		context.closePath();
		context.stroke();
	}else if(direction == "v"){
		var drawX = (((horCell / 2)) * gridSize * zoom) - (lineSize / 2) + padding;
		var drawY = (((vertCell / 2)) * gridSize * zoom) - (gridSize / 2) + padding;
		drawLine(vertCell, horCell, backgroundColor, direction);
		context.beginPath();
		context.moveTo(drawX + 1 * zoom, drawY + (15 + 1) * zoom);
		context.lineTo(drawX + (lineSize - 1) * zoom, drawY + (gridSize - 15 - 1) * zoom);
		context.moveTo(drawX + 1 * zoom, drawY + (23 + 1) * zoom);
		context.lineTo(drawX + (lineSize - 1) * zoom, drawY + (gridSize - 23 - 1) * zoom);
		context.closePath();
		context.stroke();
	}
}
function drawNumber(number, textColor, fillColor, x, y){
	//console.log(number);
	var drawY = ((x / 2) - 1) * (gridSize) + padding + (gridSize / 2);
	var drawX = ((y / 2) - 1) * (gridSize) + padding + (gridSize / 2);
	var centerX = drawX + (gridSize / 2);
	var centerY = drawY + (gridSize / 2);
	var radius = gridSize / 2.5;
	numberContext.beginPath();
	numberContext.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	numberContext.fillStyle = fillColor;
	numberContext.fill();
	numberContext.lineWidth = lineSize / 2;
	numberContext.strokeStyle = inputColor;
	numberContext.stroke();

	numberContext.font = (gridSize * .5) + "pt " + numberFont;

	numberContext.fillStyle = textColor;

	numberContext.fillText(number, drawX + (gridSize * .5), drawY + (gridSize * .75));
}

function handleClick(e){
	$("#canvasDiv").css("box-shadow", "1px 1px 5px 2px #888888");
	if(showingErrors == true){
		//resetErrors();
		resetLines();
		//resetExes();
		//showingErrors = false;
	}
	if(puzzleComplete == true){
		resetLines();
		puzzleComplete = false;
	}
	var coords = findPosition(e);
	coords = coords.split("-");
	var xCoord = coords[0] - padding;
	var yCoord = coords[1] - padding;
	//calculate clicked cell
	vertCell = (Math.floor(yCoord / (gridSize * zoom)) + 1);

	horCell = (Math.floor(xCoord / (gridSize * zoom)) + 1);


	if(vertCell < 1){
		vertCell = 1;
	}
	if(horCell < 1){
		horCell = 1;
	}
	if(vertCell > height){
		vertCell = height;
	}
	if(horCell > width){
		horCell = width;
	}
	var drawY = Math.floor((vertCell - 1) * gridSize);
	var drawX = Math.floor((horCell - 1) * gridSize);
	horCell = (horCell * 2) - 1;
	vertCell = (vertCell * 2) - 1;
	if(dragging == false){
		//startNumber = vertCell + "-" + horCell;
	}
	/*
	if(puzzleState[vertCell][horCell] != "-"){
		//console.log(activeNumber);
		if(activeNumber == "none"){
			activeNumber = vertCell + "-" + horCell;
		}else if(activeNumber == vertCell + "-" + horCell){
			//activeNumber = "none";
		}else{
			if(accessibleNumbers[activeNumber].indexOf(vertCell + "-" + horCell) != -1){
				var temp = activeNumber.split("-");

				drawConnectingLine(vertCell, horCell, temp[0], temp[1]);
				//console.log("WHAT");
				activeNumber = "none";
				//drawnLine = true;
				//dragging = false;
			}else{
				activeNumber = vertCell + "-" + horCell;
			}
		}
		//console.log(activeNumber);
	}else{
		activeNumber = "none";
	}*/
	if(puzzleState[vertCell][horCell] != "-" && drawnLine == false){
		if(startNumber != "-" ){
			//console.log(startNumber);
			var temp = startNumber.split("-");
			var startVert = temp[0] * 1;
			var startHor = temp[1] * 1;
			//console.log(finishedNumbers);
			if(finishedNumbers.indexOf(startVert + "-" + startHor) == -1){
				drawNumber(puzzleState[startVert][startHor], numberColor, circleColor, startVert, startHor);
			}else if(invalidNumbers.indexOf(startVert + "-" + startHor) != -1){
				drawNumber(puzzleState[startVert][startHor], numberColor, incorrectColor, startVert, startHor);
			}else{
				drawNumber(puzzleState[startVert][startHor], numberColor, correctColor, startVert, startHor);
			}
		}
		drawNumber(puzzleState[vertCell][horCell], numberColor, activeCircleColor, vertCell, horCell);
		startNumber = vertCell + "-" + horCell;
	}
	//console.log(horCell + "-" + vertCell);


	if(dragging == true){

		if(vertCell + "-" + horCell != startNumber && drawnLine == false){
			var temp = startNumber.split("-");
			var startVert = temp[0] * 1;
			var startHor = temp[1] * 1;
			var foundAccessible = false;
			var foundLine = false;
			if(startVert > vertCell && horCell == startHor){
				for(i = startVert - 1;i > 0;i--) {
					if(accessibleNumbers[startNumber].indexOf(i + "-" + horCell) != -1 && foundAccessible == false){
						for(j = startVert - 1;j > i;j--) {
							//console.log(j + "-" + (horCell - 1));
							//console.log(puzzleState[j][horCell - 1]);
							if(puzzleState[j][horCell - 1] != "noline" && puzzleState[j][horCell - 1] != "dot"){
								foundLine = true;
							}
						}
						if(foundLine == false){
							drawnLine = true;
							foundAccessible = true;
							drawConnectingLine(i, horCell, startVert, startHor, inputColor, false);

						}
					}
				}
			}else if(startVert < vertCell && horCell == startHor){
				for(i = startVert + 1;i < (height * 2) + 1;i++) {
					if(accessibleNumbers[startNumber].indexOf(i + "-" + horCell) != -1 && foundAccessible == false){
						for(j = startVert + 1;j < i;j++) {
							if(puzzleState[j][horCell - 1] != "noline" && puzzleState[j][horCell - 1] != "dot"){
								foundLine = true;
							}
						}
						if(foundLine == false){
							drawnLine = true;
							foundAccessible = true;
							drawConnectingLine(i, horCell, startVert, startHor, inputColor, false);
						}
					}
				}
			}else if(startHor > horCell && vertCell == startVert){
				for(i = startHor - 1;i > 0;i--) {
					if(accessibleNumbers[startNumber].indexOf(vertCell + "-" + i) != -1 && foundAccessible == false){
						for(j = startHor - 1;j > i;j--) {
							if(puzzleState[vertCell - 1][j] != "noline" && puzzleState[vertCell - 1][j] != "dot"){
								foundLine = true;
							}
						}
						if(foundLine == false){
							drawnLine = true;
							foundAccessible = true;
							drawConnectingLine(vertCell, i, startVert, startHor, inputColor, false);
						}
					}
				}
			}else if(startHor < horCell && vertCell == startVert){
				for(i = startHor + 1;i < (width * 2) + 1;i++) {
					if(accessibleNumbers[startNumber].indexOf(vertCell + "-" + i) != -1 && foundAccessible == false){
						for(j = startHor + 1;j < i;j++) {
							if(puzzleState[vertCell - 1][j] != "noline" && puzzleState[vertCell - 1][j] != "dot"){
								foundLine = true;
							}
						}
						if(foundLine == false){
							drawnLine = true;
							foundAccessible = true;
							drawConnectingLine(vertCell, i, startVert, startHor, inputColor, false);
						}
					}
				}
			}
			//console.log(startNumber);
		}
	}
	if(drawnLine == true){
		var temp = startNumber.split("-");
		var startVert = temp[0] * 1;
		var startHor = temp[1] * 1;

		if(finishedNumbers.indexOf(startVert + "-" + startHor) == -1){
			drawNumber(puzzleState[startVert][startHor], numberColor, circleColor, startVert, startHor);
		}else if(invalidNumbers.indexOf(startVert + "-" + startHor) != -1){
			drawNumber(puzzleState[startVert][startHor], numberColor, incorrectColor, startVert, startHor);
		}else{
			drawNumber(puzzleState[startVert][startHor], numberColor, correctColor, startVert, startHor);
		}
		checkSolution();
	}

}
function findPosition(e){
	var canvasElement = document.getElementById("inputCanvas");
	/*
	var x;
	var y;
	if(e.pageX || e.pageY){
		x = e.pageX;
		y = e.pageY;
	}
	else{
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= canvasElement.offsetLeft;
	y -= canvasElement.offsetTop;*/
	var x = e.pageX - $('#inputCanvas').offset().left
	var y = e.pageY - $('#inputCanvas').offset().top
	//console.log(x + "-" + y);
	return x + "-" + y;
}


function guess(){
	if (fixed == false){
		$("#guessButton").val("Guess Mode: ON");
		$("#clearButton").val("Clear Guess");
		showingErrors = false;
		resetLines();
		resetErrors();
		//resetExes();
		fixed = true;
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if (y % 2 == 0 && x % 2 != 0) {
					//var drawY = Math.floor((x - 1) / 2) * (combinedSize * zoom) + padding;
					//var drawX = Math.floor((y - 1) / 2) * (combinedSize * zoom) + (lineSize * zoom) + padding;

					if (puzzleState[x][y] == "line"){
						drawLine(x, y, guessColor, "h");
						fixedArray.push(x+"-"+y);
					}else if (puzzleState[x][y] == "xline"){
						drawXLine(x, y, guessColor, "h");
						fixedArray.push(x+"-"+y);
					}
				}else if(x % 2 == 0 &&  y % 2 != 0) {
					//var drawY = (Math.floor((x) / 2) - 1) * (combinedSize * zoom) + (lineSize * zoom) + padding;
					//var drawX = (Math.floor((y) / 2)) * (combinedSize * zoom) + padding;
					if (puzzleState[x][y] == "line"){
						drawLine(x, y, guessColor, "v");
						fixedArray.push(x+"-"+y);
					}else if (puzzleState[x][y] == "xline"){
						drawXLine(x, y, guessColor, "v");
						fixedArray.push(x+"-"+y);
					}
				}
			}
		}
	}else{

		$("#guessButton").val("Guess Mode: OFF");
		$("#clearButton").val("Clear All");
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if (fixedArray.indexOf(x+"-"+y) != -1){
					if (y % 2 == 0 && x % 2 != 0) {
						//var drawY = Math.floor((x - 1) / 2) * (combinedSize * zoom) + padding;
						//var drawX = Math.floor((y - 1) / 2) * (combinedSize * zoom) + (lineSize * zoom) + padding;
						if (puzzleState[x][y] == "line"){
							drawLine(x, y, inputColor, "h");
						}else if (puzzleState[x][y] == "xline"){
							drawXLine(x, y, inputColor, "h");
						}
					}else if(x % 2 == 0 &&  y % 2 != 0) {
						//var drawY = (Math.floor((x) / 2) - 1) * (combinedSize * zoom)+ (lineSize * zoom) + padding;
						//var drawX = (Math.floor((y) / 2)) * (combinedSize * zoom) + padding;
						if (puzzleState[x][y] == "line"){
							drawLine(x, y, inputColor, "v");
						}else if (puzzleState[x][y] == "xline"){
							drawXLine(x, y, inputColor, "v");
						}
					}
				}
			}
		}
		fixedArray = new Array();
		fixed = false;
		resetLines();
		resetErrors();
		//resetExes();
	}
}
function reset(){
	if (fixed == false){
		var clearDialog = confirm("Clear puzzle?");
		if (clearDialog == true){
			moveArray = new Array();
			fixedArray = new Array();
			display(puzzle);
		}
	}else{

		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if (fixedArray.indexOf(x+"-"+y) == -1){
					if (y % 2 == 0 && x % 2 != 0) {
						//var drawY = Math.floor((x - 1) / 2) * (combinedSize * zoom) + padding;
						//var drawX = Math.floor((y - 1) / 2) * (combinedSize * zoom) + (lineSize * zoom) + padding;
						if(x != 0 && y != 0 && x != (height * 2) && y != (width * 2)){
							puzzleState[x][y] = "noline";
							drawLine(x, y, backgroundColor, "h");

						}
					}else if(x % 2 == 0 &&  y % 2 != 0) {
						//var drawY = (Math.floor((x) / 2) - 1) * (combinedSize * zoom) + (lineSize * zoom) + padding;
						//var drawX = (Math.floor((y) / 2)) * (combinedSize * zoom) + padding;
						if(x != 0 && y != 0 && x != (height * 2) && y != (width * 2)){
							puzzleState[x][y] = "noline";
							drawLine(x, y, backgroundColor, "v");

						}
					}
				}
			}
		}
		resetLines();
		resetErrors();
		resetExes();
	}
}
function resetErrors(){
	for (x = 0;x < (height + (height + 1));x++) {
		for (y = 0;y < (width + (width + 1));y++) {
			if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] != "-"){
				drawNumber(puzzleState[x][y], numberColor, circleColor, x, y);
			}
		}
	}
}
function resetLines(){
	for (x = 0;x < (height + (height + 1));x++) {
		for (y = 0;y < (width + (width + 1));y++) {
			if(puzzleState[x][y] == "line"){
				if (x % 2 == 0) {
					//vertical
					//if(fixed == true && fixedArray.indexOf(x + "-" + y) != -1){
						//drawLine(x, y, guessColor, "v");
					//}else{
						drawLine(x, y, inputColor, "v", "line");
					//}
				}else{
					//horizontal
					//if(fixed == true && fixedArray.indexOf(x + "-" + y) != -1){
						//drawLine(x, y, guessColor, "h");
					//}else{
						drawLine(x, y, inputColor, "h", "line");
					//}
				}
			}else if(puzzleState[x][y] == "2line"){
				if (x % 2 == 0) {
					//vertical
					//if(fixed == true && fixedArray.indexOf(x + "-" + y) != -1){
						//drawLine(x, y, guessColor, "v");
					//}else{
						drawLine(x, y, inputColor, "v", "2line");
					//}
				}else{
					//horizontal
					//if(fixed == true && fixedArray.indexOf(x + "-" + y) != -1){
						//drawLine(x, y, guessColor, "h");
					//}else{
						drawLine(x, y, inputColor, "h", "2line");
					//}

				}
			}
		}
	}
}
function checkSolution() {
	if(editMode == false){
		var regex = /[0-9]*x[0-9]*/;
		var size = regex.exec(puzzle);
		size += "";
		var wxh = size.split("x");
		var height = parseInt(wxh[1].substring(0, 2));
		var width = parseInt(wxh[0]);
		//check each cell
		var lineCount = 0;
		var cellIncorrect = false;
		/*
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				lineCount = 0;
				if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] != "-"){
					if(puzzleState[x + 1][y] == "line"){
						lineCount++;
					}else if(puzzleState[x + 1][y] == "2line"){
						lineCount+=2;
					}
					if(puzzleState[x - 1][y] == "line"){
						lineCount++;
					}else if(puzzleState[x - 1][y] == "2line"){
						lineCount+=2;
					}
					if(puzzleState[x][y + 1] == "line"){
						lineCount++;
					}else if(puzzleState[x][y + 1] == "2line"){
						lineCount+=2;
					}
					if(puzzleState[x][y - 1] == "line"){
						lineCount++;
					}else if(puzzleState[x][y - 1] == "2line"){
						lineCount+=2;
					}
					if (lineCount != puzzleState[x][y] * 1){
						cellIncorrect = true;

						drawNumber(puzzleState[x][y], incorrectColor, circleColor, x, y);
					}
				}
			}
		}*/
		if(finishedNumbers.length != numberCount){
			//console.log(finishedNumbers.length);
			//console.log(numberCount);
			cellIncorrect = true;
		}
		if(invalidNumbers.length > 0){
			cellIncorrect = true;
		}
		var visitedNumbers = new Array();
		var connectedGroups = new Array();
		var groupLinesArray = new Array();
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] != "-" && visitedNumbers.indexOf(x + "-" + y) == -1){
					var groupData = travelGroup(x, y);
					var connectedGroup = groupData[0];
					var groupLines = groupData[1];
					//console.log(connectedGroup);
					connectedGroups.push(connectedGroup);
					//groupLinesArray.push(groupLines);
					visitedNumbers.push.apply(visitedNumbers, connectedGroup);
				}
			}
		}
		//console.log(connectedGroups);
		//console.log(finishedNumbers);
		//console.log(invalidNumbers);

		showingErrors = true;
		//6x6:2aa4a2aaaaaa3aa5a3aaaaaaaaaaaa1aa1a1
		//10x10:4aa5a4a4a3aa2aaaaa1a4aa3aa1aaaaaaa2aa4a45a6aaa2a2aaaa3a1a2a43a4a3a3a2aaaa1aaaaa22aaa4aa3aaaa4aaa4a3a
		if (cellIncorrect == false){
			if(connectedGroups.length > 1){
				console.log("unconnected group");
				for (j = 0;j < connectedGroups[0].length;j++) {
					for (k = 0;k < connectedGroups[0].length;k++) {
						if(j != k){
							var temp = connectedGroups[0][j].split("-");
							var startX = temp[0] * 1;
							var startY = temp[1] * 1;
							temp = connectedGroups[0][k].split("-");
							var destinationX = temp[0] * 1;
							var destinationY = temp[1] * 1;
							if(lines.indexOf(startX + "-" + startY + "/" + destinationX + "-" + destinationY) != -1 || lines.indexOf(destinationX + "-" + destinationY + "/" + startX + "-" + startY) != -1){
								//console.log(startX + "-" + startY + "/" + destinationX + "-" + destinationY);
								drawConnectingLine(destinationX, destinationY, startX, startY, incorrectColor, true);
							}
						}
					}
				}
			}else{
				console.log("correct");
				puzzleComplete = true;
				//colors solved line green
				console.log(puzzleState);
				for (x = 0;x < (height + (height + 1));x++) {
					for (y = 0;y < (width + (width + 1));y++) {
						if(puzzleState[x][y] == "line"){
							if (x % 2 == 0) {
								drawLine(x, y, correctColor, "v", "line");
							}else if(x % 2 != 0) {
								drawLine(x, y, correctColor, "h", "line");
							}
						}else if(puzzleState[x][y] == "2line"){
							if (x % 2 == 0) {
								drawLine(x, y, correctColor, "v", "2line");
							}else if(x % 2 != 0) {
								drawLine(x, y, correctColor, "h", "2line");
							}
						}
					}
				}
			}
		}else{
			showingErrors = true;
		}
	}
}

function travelGroup(xCoord, yCoord){

	var visitedCells = new Array();
	var groupLines = new Array();
	var x = xCoord;
	var y = yCoord;
	var continueTraveling = true;
	var lineType = "";
	//console.log(accessibleNumbers);
	while(continueTraveling == true){
		//console.log(x + "-" + y);
		if (visitedCells.indexOf(x + "-" + y) == -1){
			visitedCells.push(x + "-" + y);
		}
		x = x * 1;
		y = y * 1;
		var connectedCell = "none";
		var currentAccessibleNumbers = accessibleNumbers[x + "-" + y];
		//console.log(currentAccessibleNumbers);
		for (j = 0; j < currentAccessibleNumbers.length; j++){
			//console.log(currentAccessibleNumbers[j]);
			//console.log("DUB");
			if(connectedCell == "none"){
				//console.log("AH");
				var temp = currentAccessibleNumbers[j].split("-");
				var tempX = temp[0] * 1;
				var tempY = temp[1] * 1;
				var validDirection = false
				if(x < tempX){
					if(puzzleState[x + 1][y] == "line" || puzzleState[x + 1][y] == "2line"){
						lineType = puzzleState[x + 1][y];
						validDirection = true;
					}
				}else if(x > tempX){
					if(puzzleState[x - 1][y] == "line" || puzzleState[x - 1][y] == "2line"){
						lineType = puzzleState[x - 1][y];
						validDirection = true;
					}
				}else if(y < tempY){
					if(puzzleState[x][y + 1] == "line" || puzzleState[x][y + 1] == "2line"){
						lineType = puzzleState[x][y + 1];
						validDirection = true;
					}
				}else if(y > tempY){
					if(puzzleState[x][y - 1] == "line" || puzzleState[x][y - 1] == "2line"){
						lineType = puzzleState[x][y - 1];
						validDirection = true;
					}
				}
				if(validDirection == true && visitedCells.indexOf(currentAccessibleNumbers[j]) == -1){
					connectedCell = currentAccessibleNumbers[j];
					//console.log(connectedCell);
					//console.log("FUCK");
				}
			}
		}
		if(connectedCell != "none"){
			if(visitedCells.indexOf(connectedCell) == -1){

				var temp = connectedCell.split("-");
				if (groupLines.indexOf(x + "-" + y + "/" + temp[0] + "-" + temp[1] + "/" + lineType) == -1){
					groupLines.push(x + "-" + y + "/" + temp[0] + "-" + temp[1] + "/" + lineType);
				}
				x = temp[0] * 1;
				y = temp[1] * 1;
			}
		}else{
			var index = visitedCells.indexOf(x + "-" + y);
			if (index != 0){
				var lastCell = visitedCells[index - 1].split("-");
				x = lastCell[0] * 1;
				y = lastCell[1] * 1;

			}else{
				continueTraveling = false;
			}
		}

	}
	//console.log(groupLines);
	var returnArray = new Array();
	returnArray.push(visitedCells);
	returnArray.push(groupLines);
	return returnArray;
}

function stopGeneration(){
	worker.terminate();
	console.timeEnd("generate");
	$("#generateButton").css("display", "inline");
	$("#stopGenerationButton").css("display", "none");
	$("#genProgress").css("display", "none");
}
function generate(){
	editMode = false;
	var progressBar = $("#genProgress");
	progressBar.attr("value", 0);
	progressBar.attr("max", 100);
	var userWidth = $("#genWidthField").val();
	var userHeight = $("#genHeightField").val();
	var symmetry = $("input[name=symmetry]:checked").val();
	if (symmetry == "4rotational" && userWidth != userHeight){
		symmetry = "4rotational";
	}
	var difficulty = $("input[name=difficulty]:checked").val();
	if (($.isNumeric(userWidth) == true) && ($.isNumeric(userHeight) == true) && (userHeight * userWidth < 5000) && (userHeight > 4) && (userWidth > 4)){
          worker = new Worker("/static/js/solverGenerator.js");
          worker.onerror = function(event) {
            $("#messageOutput")
                .text(event.message + " (" + event.filename + ":" +
                      event.lineno + ")");
          };
          var multiplier = 1;
          if (symmetry == "2rotational") {
            multiplier = .5
		}else if(symmetry == "4rotational"){
			multiplier = .25
		}
		//var max = ((userWidth * userHeight) * multiplier) + (userWidth * userHeight * .7);
		//var max = (userWidth * userHeight) / 1.5;
		var progress = 0;
		var loop;
		var max;
		progressBar.css("display", "block");
		$("#stopGenerationButton").css("display", "inline");
		$("#generateButton").css("display", "none");
		progressBar.attr("max", max);
		progressBar.attr("value", progress);
		console.time("generate");
		worker.onmessage = function (event) {
			data = event.data;
			if(data.indexOf("done") != -1){
				console.timeEnd("generate");
				$("#genProgress").css("display", "none");
				$("#stopGenerationButton").css("display", "none");
				$("#generateButton").css("display", "inline");
				temp = data.split("_");
				genPuzzle = temp[1];
				$("#userPuzzle").val("");
				$("#userSolvePuzzle").val("");
				$("#generatedPuzzle").val(genPuzzle);
				puzzle = genPuzzle;
				console.log(puzzle);
				display(puzzle);
				//drawLoop(loop);

				//$.post("../php/insertMasyu.php", {height: userHeight, width: userWidth, puzzleString: genPuzzle, difficulty: difficulty.toLowerCase()}).done(function(data) {
				//	if(data.indexOf("success") != -1){

				//	}
				//});
			}else if(data.indexOf("adding") != -1){
				progress++;
				progressBar.attr("value", progress);
			}else if(data.indexOf("max") != -1){
				temp = data.split("_");
				progressBar.attr("max", temp[1]);
				//console.log("FK");
			}else if(data.indexOf("startremove") != -1){
				temp = data.split("_");
				max = temp[1];
				progressBar.attr("max", max);
				progress = 1
				progressBar.attr("value", progress);
				//progress++;
				//progressBar.attr("value", progress);
			}else if(data.indexOf("removing") != -1){
				progress++;
				progressBar.attr("value", progress);
			}else if(data.indexOf("error") != -1){
				//console.log(data);
			}else if(data.indexOf("reset") != -1){
				progress = 1;
				progressBar.attr("value", progress);
			}else{
				//console.log(data);
			}
		};
		worker.postMessage("generate_" + userWidth + "_" + userHeight + "_" + difficulty);
	}
}

function stopSolving(){
	worker.terminate();
	console.timeEnd("solve");
	$("#solveButton").css("display", "inline");
	$("#stopSolvingButton").css("display", "none");
	$("#solveProgress").css("display", "none");
}
function solve(){

	var max = 100;
	var progressBar = $("#solveProgress");
	progressBar.attr("value", 0);
	progressBar.attr("max", max);
	var userSolvePuzzle = $("#userSolvePuzzle").val();
	if (userSolvePuzzle != ""){

		editMode = false;
		puzzle = userSolvePuzzle;
		var regex = /[0-9]*x[0-9]*/;
		var size = regex.exec(puzzle);
		size += "";
		var wxh = size.split("x");
		height = parseInt(wxh[1].substring(0, 2));
		width = parseInt(wxh[0]);
		max = (width * height) * 2 + height + width;
		display(userSolvePuzzle);
	}else{
		tempPuzzle = width + "x" + height + ":";
		for (x = 0;x < (height + (height + 1));x++) {
			for (y = 0;y < (width + (width + 1));y++) {
				if (y % 2 != 0 && x % 2 != 0) {
					if (puzzleState[x][y] == "-"){
						tempPuzzle += "a";
					}else{
						tempPuzzle += puzzleState[x][y];
					}
				}
			}
		}
		max = (width * height) * 2 + height + width;
		puzzle = tempPuzzle;
		console.log("solving user puzzle: " + puzzle)
	}
	$("#generatedPuzzle").val(puzzle);
	worker = new Worker("/static/js/solverGenerator.js");
	worker.onerror = function(event){
		console.log(event.message + " (" + event.filename + ":" + event.lineno + ")");
	};
	var progress = 0;
	progressBar.css("display", "block");
	$("#stopSolvingButton").css("display", "inline");
	$("#solveButton").css("display", "none");
	progressBar.attr("max", max);
	progressBar.attr("value", progress);
	console.time("solve");
	worker.onmessage = function (event) {
		data = event.data;
		if(data.indexOf("done") != -1){
			//console.log(data);
			console.timeEnd("solve");
			//alert(data);
			$("#solveProgress").css("display", "none");
			$("#stopSolvingButton").css("display", "none");
			$("#solveButton").css("display", "inline");
			temp = data.split("_");
			var solutionString = temp[3];
			displaySolution(solutionString);
			//console.log(solutionString);
		}else if(data.indexOf("undraw") != -1){
			//progress--;
			//progressBar.attr("value", progress);
			temp = data.split("_");
			var type = temp[1];
			temp = temp[2].split("-");
			var x = parseInt(temp[1]) ;
			var y = parseInt(temp[0]);
			drawProgress(type, x, y);
		}else if(data.indexOf("draw") != -1){
			temp = data.split("_");
			if(temp[3] != "guess"){
				progress++;
				progressBar.attr("value", progress);
			}
			//console.log(progress + " " + max);

			var type = temp[1];
			temp = temp[2].split("-");
			drawProgress(type, parseInt(temp[1]), parseInt(temp[0]));
		}else if(data.indexOf("error") != -1){
			console.log(data);
			worker.terminate();
			$("#solveProgress").css("display", "none");
			$("#stopSolvingButton").css("display", "none");
			$("#solveButton").css("display", "inline");
		}else{
			//console.log(data);
		}
	};
	var difficulty = $("input[name=difficulty]:checked").val();
	//worker.postMessage("solve_" + puzzle + "_" + "medium");
	worker.postMessage("solve_" + puzzle + "_" + difficulty);
}
function drawProgress(type, x, y){
	switch (type){
		case "xline":
			puzzleState[y][x] = "xline";
			if (y % 2 != 0 && x % 2 == 0) {
				drawXLine(y, x, inputColor, "h");
			}else if(x % 2 != 0 && y % 2 == 0) {
				drawXLine(y, x, inputColor, "v");
			}

			break;
		case "noline":
			puzzleState[y][x] = "noline";
			if (y % 2 != 0 && x % 2 == 0) {
				drawLine(y, x, backgroundColor, "h");
			}else if(x % 2 != 0 &&  y % 2 == 0) {
				drawLine(y, x, backgroundColor, "v");
			}

			break;
		case "line":
			puzzleState[y][x] = "line";
			if (y % 2 != 0 && x % 2 == 0) {
				drawLine(y, x, inputColor, "h");
			}else if(x % 2 != 0 &&  y % 2 == 0) {
				drawLine(y, x, inputColor, "v");
			}

			break;
	}
}
function displaySolution(solution){
	//console.log(solution);
	var solutionArray = solution.split("-");
	var z = 0;
	for (x = 0;x < (height + (height + 1));x++) {
		for (y = 0;y < (width + (width + 1));y++) {

			switch (solutionArray[z]){
			case "nonumber":
				break;
			case "xline":
				puzzleState[x][y] = "xline";
				if (y % 2 != 0 && x % 2 == 0) {
					drawXLine(x, y, inputColor, "v");
				}else if(x % 2 != 0 && y % 2 == 0) {
					drawXLine(x, y, inputColor, "h");
				}

				break;
			case "noline":

				break;
			case "line":
				puzzleState[x][y] = "line";
				if (y % 2 != 0 && x % 2 == 0) {
					drawLine(x, y, inputColor, "v", "line");
				}else if(x % 2 != 0 &&  y % 2 == 0) {
					drawLine(x, y, inputColor, "h", "line");
				}

				break;
			case "2line":
				puzzleState[x][y] = "2line";
				if (y % 2 != 0 && x % 2 == 0) {
					drawLine(x, y, inputColor, "v", "2line");
				}else if(x % 2 != 0 &&  y % 2 == 0) {
					drawLine(x, y, inputColor, "h", "2line");
				}

				break;
			default:

				break;
			}
			z++;
		}
	}
	modifyRemainingLines(x, y, "all", false);
	calculateSolutionLines();
}
function displayGrid(){
	editMode = true;
	width = $("#solveWidthField").val();
	height = $("#solveHeightField").val();
	tempString = width + "x" + height + ":";
	for (z=0;z <= (width * height);z++) {
		tempString += "a";
	}
	puzzle = tempString;
	display(tempString);
}
