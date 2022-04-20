
onmessage = function(e) {
  var params = e.data.split("_");
  if (params[0] == "generate") {
    mode = "generate";
    generator = new generateObject(params[1], params[2], params[3]);
    genPuzzle = generator.generate();
    while (genPuzzle == "none") {
      generator = new generateObject(params[1], params[2], params[3]);
      genPuzzle = generator.generate();
    }
    postMessage("done_" + genPuzzle);
  } else {
    mode = "solve";
    solver = new solveObject(params[1], params[2]);
    solver.solve();
    postMessage("done_" + solver.getSolution());
  }
};
function generateObject(w, h, diff) {
  this.difficulty = diff;
  this.width = w * 1;
  this.height = h * 1;

  generateObject.prototype.generate = function() {
    var genCount = 0;
    var isSolvable = "false";
    while (isSolvable == "false") {
      postMessage("reset");
      generateState = generateBridges(this.width, this.height);
      var fillsGrid = checkFillsGrid(this.width, this.height, generateState);
      if (fillsGrid == true) {
        var generatedPuzzle =
            generatePuzzleString(generateState, this.width, this.height);
        generateState = replaceNumbers(generateState, generatedPuzzle,
                                       this.width, this.height);
        var tempDifficulty = this.difficulty;
        if (this.difficulty != "medium" && this.difficulty != "easy") {
          tempDifficulty = "medium";
        }
        var solver = new solveObject(generatedPuzzle, tempDifficulty);
        solver.solve();
        var temp = solver.getSolution().split("_");
        var tempSolvable = temp[0];
        var solveState = solver.getSolutionState();
        var textState = JSON.stringify(solveState);
        var lineCount = (textState.match(/line/g) || []).length -
                        (textState.match(/noline/g) || []).length;
        console.log(lineCount);
        var numberCount = 0
        for (x = 0; x <= (this.height * 2); x++) {
          for (y = 0; y <= (this.width * 2); y++) {
            if (x % 2 != 0 && y % 2 != 0) {
              if (solveState[x][y] != "nonumber") {
                numberCount++;
              }
            }
          }
        }
        console.log(numberCount);
        // console.log(solver.getSolution());
        var numberLimit = (this.width * this.height) / 3;
        if (this.difficulty == "easy") {
          numberLimit = (this.width * this.height) / 4;
        }

        var lineLimit = (this.width * this.height) / 2;

        if ((this.width * 1 + this.height * 1) / 2 > 30) {
          lineLimit = (this.width * this.height) / 3;
          numberLimit = (this.width * this.height) / 4;
        }
        if ((this.width * 1 + this.height * 1) / 2 < 6) {

          numberLimit = 0;
          lineLimit = 0;
        }
        if (lineCount < lineLimit || numberCount < numberLimit) {
          // var generatedPuzzle = generatePuzzleString(generateState,
          // this.width, this.height);
          console.log("too sparse ");
        } else {
          postMessage("max_" + lineCount * 1.5);
          // if(tempSolvable == "false"){
          generateState = refactorBridges(generateState, solveState, this.width,
                                          this.height, this.difficulty);
          //}
          var generatedPuzzle =
              generatePuzzleString(generateState, this.width, this.height);
          solver = new solveObject(generatedPuzzle, this.difficulty);
          solver.solve();
          temp = solver.getSolution().split("_");
          tempSolvable = temp[0];
          isSolvable = tempSolvable + "";
          var solveCount = temp[1] * 1;
          var solveState = temp[2];
          // console.log("solvable: " + isSolvable);
          // console.log(generatedPuzzle);
          // isSolvable = true;
        }
      }
      genCount++;
    }

    var newGenerateState = generateState;
    var newSolveCount = solveCount * 1;
    var refactorLimit = 2;
    if ((this.width + this.height) / 2 > 18) {
      // console.log("what");
      refactorLimit = 1;
    }
    for (q = 0; q < refactorLimit; q++) {
      newGenerateState =
          modifyDifficulty(newGenerateState, this.width, this.height,
                           this.difficulty, newSolveCount);
      generatedPuzzle =
          generatePuzzleString(newGenerateState, this.width, this.height);
      var solver = new solveObject(generatedPuzzle, this.difficulty);
      solver.solve();
      var temp = solver.getSolution().split("_");
      var newSolveCount = temp[1] * 1;
      // console.log(newSolveCount);
    }
    console.log(solveCount);
    console.log(newSolveCount);

    console.log("attempts " + genCount);
    return generatedPuzzle;
  }
};
function checkFillsGrid(width, height, state) {
  var fillsGrid = true;
  var foundNumber = false;
  for (x = 0; x <= (height * 2); x++) {
    var y = 1;
    if (x % 2 != 0) {
      if (state[x][y] != "nonumber") {
        foundNumber = true;
      }
    }
  }
  if (foundNumber == false) {
    fillsGrid = false;
  }

  foundNumber = false;
  for (x = 0; x <= (height * 2); x++) {
    var y = width * 2 - 1;
    if (x % 2 != 0) {
      if (state[x][y] != "nonumber") {
        foundNumber = true;
      }
    }
  }
  if (foundNumber == false) {
    fillsGrid = false;
  }

  foundNumber = false;
  for (y = 0; y <= (width * 2); y++) {
    var x = 1;
    if (y % 2 != 0) {
      if (state[x][y] != "nonumber") {
        foundNumber = true;
      }
    }
  }
  if (foundNumber == false) {
    fillsGrid = false;
  }

  foundNumber = false;
  for (y = 0; y <= (width * 2); y++) {
    var x = height * 2 - 1;
    if (y % 2 != 0) {
      if (state[x][y] != "nonumber") {
        foundNumber = true;
      }
    }
  }
  if (foundNumber == false) {
    fillsGrid = false;
  }
  return fillsGrid;
};
function replaceNumbers(state, puzzleString, width, height) {
  var temp = puzzleString.split(":");
  var data = temp[1].split("");
  var z = 0;
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if (x % 2 != 0 && y % 2 != 0) {
        if (data[z] != "a") {
          state[x][y] = data[z] * 1;
        }
        z++;
      }
    }
  }
  return state;
};
function generatePuzzleString(generateState, width, height) {
  var puzzleString = width + "x" + height + ":";
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if (x % 2 != 0 && y % 2 != 0) {
        if (generateState[x][y] != "nonumber") {
          if (generateState[x][y] == "number") {
            var lineCount = 0;
            if (generateState[x + 1][y] == "line") {
              lineCount++;
            } else if (generateState[x + 1][y] == "2line") {
              lineCount += 2;
            }
            if (generateState[x - 1][y] == "line") {
              lineCount++;
            } else if (generateState[x - 1][y] == "2line") {
              lineCount += 2;
            }
            if (generateState[x][y + 1] == "line") {
              lineCount++;
            } else if (generateState[x][y + 1] == "2line") {
              lineCount += 2;
            }
            if (generateState[x][y - 1] == "line") {
              lineCount++;
            } else if (generateState[x][y - 1] == "2line") {
              lineCount += 2;
            }
            puzzleString = puzzleString + "" + lineCount;
          } else {
            puzzleString = puzzleString + "" + generateState[x][y] + "";
          }
        } else {
          puzzleString = puzzleString + "a";
        }
      }
    }
  }
  return puzzleString;
};
function modifyDifficulty(generateState, w, h, difficulty, initialSolveCount) {
  var width = w;
  var height = h;
  var maxSolveCount = initialSolveCount * 1;
  var minSolveCount = initialSolveCount * 1;
  var generateState = generateState;
  var numbersArray = new Array();
  var pairs = new Array();
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 == 1) && (x % 2 == 1)) {
        if (generateState[x][y] != "nonumber") {
          numbersArray.push(x + "-" + y);

          var continueTraveling = true;
          for (i = x; i > 0; i -= 2) {
            if (generateState[i][y] != "nonumber" && x != i &&
                continueTraveling == true) {
              var type = generateState[i + 1][y];
              if (pairs.indexOf(i + "-" + y + "/" + x + "-" + y + "/" + type) ==
                  -1) {
                pairs.push(x + "-" + y + "/" + i + "-" + y + "/" + type);
              }
              continueTraveling = false;
            }
          }
          continueTraveling = true;
          for (i = x; i < height * 2; i += 2) {
            if (generateState[i][y] != "nonumber" && x != i &&
                continueTraveling == true) {
              var type = generateState[i - 1][y];
              if (pairs.indexOf(i + "-" + y + "/" + x + "-" + y + "/" + type) ==
                  -1) {
                pairs.push(x + "-" + y + "/" + i + "-" + y + "/" + type);
              }
              continueTraveling = false;
            }
          }
          continueTraveling = true;
          for (i = y; i > 0; i -= 2) {
            if (generateState[x][i] != "nonumber" && y != i &&
                continueTraveling == true) {
              var type = generateState[x][i + 1];
              if (pairs.indexOf(x + "-" + i + "/" + x + "-" + y + "/" + type) ==
                  -1) {
                pairs.push(x + "-" + y + "/" + x + "-" + i + "/" + type);
              }
              continueTraveling = false;
            }
          }

          continueTraveling = true;
          for (i = y; i < width * 2; i += 2) {
            if (generateState[x][i] != "nonumber" && y != i &&
                continueTraveling == true) {
              var type = generateState[x][i - 1];
              if (pairs.indexOf(x + "-" + i + "/" + x + "-" + y + "/" + type) ==
                  -1) {
                pairs.push(x + "-" + y + "/" + x + "-" + i + "/" + type);
              }
              continueTraveling = false;
            }
          }
        }
      }
    }
  }

  pairs = shuffle(pairs);
  // console.log(pairs);
  // console.log(pairs.length);

  for (j2 = 0; j2 < pairs.length; j2++) {

    var tempPair = pairs[j2].split("/");
    var firstRandomNumber = tempPair[0];
    var secondRandomNumber = tempPair[1];
    var type = tempPair[2];

    var temp = firstRandomNumber.split("-");
    var tempX = temp[0] * 1;
    var tempY = temp[1] * 1;
    temp2 = secondRandomNumber.split("-");
    var tempX2 = temp2[0] * 1;
    var tempY2 = temp2[1] * 1;

    if (type == "line") {
      // console.log(pairs[j]);
      generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 + 1;
      generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 1;
      var generatedPuzzle = generatePuzzleString(generateState, width, height);
      var solver = new solveObject(generatedPuzzle, difficulty);

      solver.solve();

      var temp = solver.getSolution().split("_");
      isRefactorSolvable = temp[0];
      var newSolveCount = temp[1] * 1;
      var isModified = false;
      if (isRefactorSolvable == "true") {
        if (difficulty != "easy") {
          if (newSolveCount >= maxSolveCount) {
            maxSolveCount = newSolveCount * 1;
            isModified = true;
            // console.log("modifying line to 2line");
          }
        } else {
          if (newSolveCount < minSolveCount) {
            minSolveCount = newSolveCount * 1;
            isModified = true;
            // console.log("modifying line to 2line");
          }
        }
      }
      if (isModified == false) {
        generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 - 1;
        generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 1;

        generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 - 1;
        generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 1;

        var generatedPuzzle =
            generatePuzzleString(generateState, width, height);
        var solver = new solveObject(generatedPuzzle, difficulty);

        solver.solve();

        var temp = solver.getSolution().split("_");
        isRefactorSolvable = temp[0];
        var newSolveCount = temp[1] * 1;
        var isModified = false;
        if (isRefactorSolvable == "true") {
          if (difficulty != "easy") {
            if (newSolveCount >= maxSolveCount) {
              maxSolveCount = newSolveCount * 1;
              isModified = true;
              // console.log("modifying line to noline");
            }
          } else {
            if (newSolveCount < minSolveCount) {
              minSolveCount = newSolveCount * 1;
              isModified = true;
              // console.log("modifying line to noline");
            }
          }
        }
        if (isModified == false) {
          generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 + 1;
          generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 1;
          // console.log("not modifying");
        }
      }
    } else if (type == "2line") {
      generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 - 1;
      generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 1;
      var generatedPuzzle = generatePuzzleString(generateState, width, height);
      // console.log(generatedPuzzle);
      // console.log(difficulty);

      var solver = new solveObject(generatedPuzzle, difficulty);

      solver.solve();

      var temp = solver.getSolution().split("_");
      isRefactorSolvable = temp[0];
      var newSolveCount = temp[1] * 1;
      var isModified = false;
      if (isRefactorSolvable == "true") {
        if (difficulty != "easy") {
          if (newSolveCount >= maxSolveCount) {
            maxSolveCount = newSolveCount * 1;
            isModified = true;
            // console.log("modifying 2line to line");
          }
        } else {
          if (newSolveCount < minSolveCount) {
            minSolveCount = newSolveCount * 1;
            isModified = true;
            // console.log("modifying 2line to line");
          }
        }
      }
      if (isModified == false) {
        generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 + 1;
        generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 1;

        generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 - 2;
        generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 2;
        var generatedPuzzle =
            generatePuzzleString(generateState, width, height);
        var solver = new solveObject(generatedPuzzle, difficulty);
        solver.solve();
        var temp = solver.getSolution().split("_");
        isRefactorSolvable = temp[0];
        var newSolveCount = temp[1] * 1;
        var isModified = false;
        if (isRefactorSolvable == "true") {
          if (difficulty != "easy") {
            if (newSolveCount >= maxSolveCount) {
              maxSolveCount = newSolveCount * 1;
              isModified = true;
              // console.log("modifying 2line to noline");
            }
          } else {
            if (newSolveCount < minSolveCount) {
              minSolveCount = newSolveCount * 1;
              isModified = true;
              // console.log("modifying 2line to noline");
            }
          }
        }
        if (isModified == false) {
          generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 + 2;
          generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 2;
          // console.log("not modifying");
        }
      }
    } else if (type == "noline") {
      generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 + 1;
      generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 1;
      var generatedPuzzle = generatePuzzleString(generateState, width, height);
      // console.log(generatedPuzzle);
      // console.log(difficulty);

      var solver = new solveObject(generatedPuzzle, difficulty);

      solver.solve();

      var temp = solver.getSolution().split("_");
      isRefactorSolvable = temp[0];
      var newSolveCount = temp[1] * 1;
      var isModified = false;
      if (isRefactorSolvable == "true") {
        if (difficulty != "easy") {
          if (newSolveCount >= maxSolveCount) {
            maxSolveCount = newSolveCount * 1;
            isModified = true;
            // console.log("modifying noline to line");
          }
        } else {
          if (newSolveCount < minSolveCount) {
            minSolveCount = newSolveCount * 1;
            isModified = true;
            // console.log("modifying noline to line");
          }
        }
      }
      if (isModified == false) {
        generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 - 1;
        generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 1;

        generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 + 2;
        generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 2;
        var generatedPuzzle =
            generatePuzzleString(generateState, width, height);
        var solver = new solveObject(generatedPuzzle, difficulty);
        solver.solve();
        var temp = solver.getSolution().split("_");
        isRefactorSolvable = temp[0];
        var newSolveCount = temp[1] * 1;
        var isModified = false;
        if (isRefactorSolvable == "true") {
          if (difficulty != "easy") {
            if (newSolveCount >= maxSolveCount) {
              maxSolveCount = newSolveCount * 1;
              isModified = true;
              // console.log("modifying noline to 2line");
            }
          } else {
            if (newSolveCount < minSolveCount) {
              minSolveCount = newSolveCount * 1;
              isModified = true;
              // console.log("modifying noline to 2line");
            }
          }
        }
        if (isModified == false) {
          generateState[tempX2][tempY2] = generateState[tempX2][tempY2] * 1 - 2;
          generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 2;
          // console.log("not modifying");
        }
      }
    }
    postMessage("adding");
  }
  // console.log(initialSolveCount);
  // console.log(maxSolveCount);
  // var generatedPuzzle = generatePuzzleString(generateState, width,
  // height);
  return generateState;
};
function refactorBridges(generateState, solveState, w, h, difficulty) {
  // console.log(generateState);
  var width = w;
  var height = h;
  var generateState = generateState;
  var numbersArray = new Array();
  var pairs = new Array();
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 == 1) && (x % 2 == 1)) {
        if (generateState[x][y] != "nonumber") {
          numbersArray.push(x + "-" + y);

          var continueTraveling = true;
          for (i = x; i > 0; i -= 2) {
            if (generateState[i][y] != "nonumber" && x != i &&
                continueTraveling == true) {
              var type = generateState[i + 1][y];
              pairs.push(x + "-" + y + "/" + i + "-" + y + "/" + type);
              continueTraveling = false;
            }
          }
          continueTraveling = true;
          for (i = x; i < height * 2; i += 2) {
            if (generateState[i][y] != "nonumber" && x != i &&
                continueTraveling == true) {
              var type = generateState[i - 1][y];
              pairs.push(x + "-" + y + "/" + i + "-" + y + "/" + type);
              continueTraveling = false;
            }
          }
          continueTraveling = true;
          for (i = y; i > 0; i -= 2) {
            if (generateState[x][i] != "nonumber" && y != i &&
                continueTraveling == true) {
              var type = generateState[x][i + 1];
              pairs.push(x + "-" + y + "/" + x + "-" + i + "/" + type);
              continueTraveling = false;
            }
          }

          continueTraveling = true;
          for (i = y; i < width * 2; i += 2) {
            if (generateState[x][i] != "nonumber" && y != i &&
                continueTraveling == true) {
              var type = generateState[x][i - 1];
              pairs.push(x + "-" + y + "/" + x + "-" + i + "/" + type);
              continueTraveling = false;
            }
          }
        }
      }
    }
  }
  // console.log(pairs);
  // console.log(numbersArray);
  var generatedBridgesCount = calculateBridgeCount(generateState, pairs);
  // console.log(generatedBridgesCount);

  var solvedBridgesCount = calculateBridgeCount(solveState, pairs);
  // console.log(solvedBridgesCount);

  pairs = shuffle(pairs);
  // numbersArray = shuffle(numbersArray);
  // var firstRandomNumber = numbersArray[0];
  // var secondRandomNumber = numbersArray[1];
  var isRefactorSolvable = "false";
  if (generatedBridgesCount == solvedBridgesCount) {
    isRefactorSolvable = "true";
  }
  var refactorCount = 0;
  var newSolveState = solveState;
  while (isRefactorSolvable == "false" && refactorCount < 3) {
    refactorCount++;
    // console.log(refactorCount);
    pairs = shuffle(pairs);
    var visitedPairs = new Array();
    for (i2 = 0; i2 < pairs.length; i2++) {
      var temp = pairs[i2].split("/");
      var firstRandomNumber = temp[0];
      var secondRandomNumber = temp[1];
      var type = temp[2];

      var temp = firstRandomNumber.split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      temp = secondRandomNumber.split("-");
      var tempX2 = temp[0] * 1;
      var tempY2 = temp[1] * 1;
      var solvedType;
      if (tempX > tempX2) {
        solvedType = newSolveState[tempX - 1][tempY];
      } else if (tempX < tempX2) {
        solvedType = newSolveState[tempX + 1][tempY];
      } else if (tempY > tempY2) {
        solvedType = newSolveState[tempX][tempY - 1];
      } else if (tempY < tempY2) {
        solvedType = newSolveState[tempX][tempY + 1];
      }
      var lineCells = new Array();
      var solvedNumbers = calculateSolvedNumbers(newSolveState);
      if ((solvedNumbers.indexOf(firstRandomNumber) == -1 ||
           solvedNumbers.indexOf(secondRandomNumber) == -1) &&
          visitedPairs.indexOf(secondRandomNumber + "/" + firstRandomNumber +
                               "/" + type) == -1) {
        var refactorPair = true;
        if (type == "noline") {
          var possibleNewLine = true;
          lineCells = new Array();
          if (tempX > tempX2) {
            for (x2 = tempX - 1; x2 > tempX2; x2--) {
              if (x2 % 2 != 0) {
                if (generateState[x2][tempY - 1] == "line" ||
                    generateState[x2][tempY - 1] == "2line") {
                  possibleNewLine = false;
                }
              } else {
                lineCells.push(x2 + "-" + tempY);
              }
            }
          } else if (tempX < tempX2) {
            for (x2 = tempX + 1; x2 < tempX2; x2++) {
              if (x2 % 2 != 0) {
                if (generateState[x2][tempY - 1] == "line" ||
                    generateState[x2][tempY - 1] == "2line") {
                  possibleNewLine = false;
                }
              } else {
                lineCells.push(x2 + "-" + tempY);
              }
            }
          } else if (tempY > tempY2) {
            for (y2 = tempY - 1; y2 > tempY2; y2--) {
              if (y2 % 2 != 0) {
                if (generateState[tempX - 1][y2] == "line" ||
                    generateState[tempX - 1][y2] == "2line") {
                  possibleNewLine = false;
                }
              } else {
                lineCells.push(tempX + "-" + y2);
              }
            }
          } else if (tempY < tempY2) {
            for (y2 = tempY + 1; y2 < tempY2; y2++) {
              if (y2 % 2 != 0) {
                if (generateState[tempX - 1][y2] == "line" ||
                    generateState[tempX - 1][y2] == "2line") {
                  possibleNewLine = false;
                }
              } else {
                lineCells.push(tempX + "-" + y2);
              }
            }
          }
          // possibleNewLine = false;
          if (possibleNewLine == true) {
            // console.log("new line between " + tempX + "-" + tempY + " " +
            // tempX2 + "-" + tempY2); console.log(lineCells);
          } else {
            refactorPair = false;
          }
        }
        if (refactorPair == true) {
          visitedPairs.push(pairs[i2]);
          // console.log(firstRandomNumber);

          // console.log(generateState[tempX][tempY]);

          if (type == "2line") {

            generateState[tempX][tempY] = generateState[tempX][tempY] * 1 - 1;
            generatedBridgesCount--;
            solvedBridgesCount--;

          } else if (type == "line") {
            // console.log("changing " + generateState[tempX][tempY] + " at
            // " + tempX + "-" + tempY);
            generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 1;
            generatedBridgesCount++;
            solvedBridgesCount++;
          } else if (type == "noline") {
            generateState[tempX][tempY] = generateState[tempX][tempY] * 1 + 1;
            generatedBridgesCount++;
            solvedBridgesCount++;
          }

          if (type == "2line") {
            generateState[tempX2][tempY2] =
                generateState[tempX2][tempY2] * 1 - 1;
          } else if (type == "line") {
            // console.log("changing " + generateState[tempX2][tempY2] + "
            // at " + tempX2 + "-" + tempY2);
            generateState[tempX2][tempY2] =
                generateState[tempX2][tempY2] * 1 + 1;
          } else if (type == "noline") {
            generateState[tempX2][tempY2] =
                generateState[tempX2][tempY2] * 1 + 1;
            generatedBridgesCount++;
            solvedBridgesCount++;
          }

          var generatedPuzzle =
              generatePuzzleString(generateState, width, height);
          // console.log(generatedPuzzle);
          var solver = new solveObject(generatedPuzzle, difficulty);
          solver.solve();
          var temp = solver.getSolution().split("_");
          isRefactorSolvable = temp[0];
          // console.log(isRefactorSolvable);
          newSolveState = solver.getSolutionState();

          var newBridgesCount = calculateBridgeCount(newSolveState, pairs);
          var newSolvedNumbers = calculateSolvedNumbers(newSolveState);
          // console.log(newBridgesCount);
          // if(newBridgesCount > solvedBridgesCount + 1){
          if (newSolvedNumbers.length >= solvedNumbers.length) {
            var correspondingPair =
                tempX2 + "-" + tempY2 + "/" + tempX + "-" + tempY + "/" + type;
            var index = pairs.indexOf(correspondingPair);
            if (type == "2line") {
              pairs[i2] = tempX + "-" + tempY + "/" + tempX2 + "-" + tempY2 +
                          "/" +
                          "line";
              pairs[index] = tempX2 + "-" + tempY2 + "/" + tempX + "-" + tempY +
                             "/" +
                             "line";
            } else if (type == "line") {
              pairs[i2] = tempX + "-" + tempY + "/" + tempX2 + "-" + tempY2 +
                          "/" +
                          "2line";
              pairs[index] = tempX2 + "-" + tempY2 + "/" + tempX + "-" + tempY +
                             "/" +
                             "2line";
            } else if (type == "noline") {
              pairs[i2] = tempX + "-" + tempY + "/" + tempX2 + "-" + tempY2 +
                          "/" +
                          "line";
              pairs[index] = tempX2 + "-" + tempY2 + "/" + tempX + "-" + tempY +
                             "/" +
                             "line";
              for (j = 0; j < lineCells.length; j++) {
                var temp = lineCells[j].split("-");
                var newLineX = temp[0] * 1;
                var newLineY = temp[1] * 1;
              }
              generateState[newLineX][newLineY] = "line";
            }

          } else {
            if (isRefactorSolvable == "false") {
              if (type == "2line") {
                generateState[tempX2][tempY2] =
                    generateState[tempX2][tempY2] * 1 + 1;
                generateState[tempX][tempY] =
                    generateState[tempX][tempY] * 1 + 1;
                generatedBridgesCount++;
                solvedBridgesCount++;
              } else if (type == "line") {
                generateState[tempX2][tempY2] =
                    generateState[tempX2][tempY2] * 1 - 1;
                generateState[tempX][tempY] =
                    generateState[tempX][tempY] * 1 - 1;
                generatedBridgesCount--;
                solvedBridgesCount--;
              } else if (type == "noline") {
                generateState[tempX2][tempY2] =
                    generateState[tempX2][tempY2] * 1 - 1;
                generateState[tempX][tempY] =
                    generateState[tempX][tempY] * 1 - 1;
                generatedBridgesCount--;
                solvedBridgesCount--;
              }
            }
          }
        }
      }
    }
  }
  return generateState;
};
function calculateSolvedNumbers(state) {
  var solvedNumbers = new Array();
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 == 1) && (x % 2 == 1)) {
        if (state[x][y] != "nonumber") {
          var lineCount = 0;
          if (state[x + 1][y] == "line") {
            lineCount++;
          } else if (state[x + 1][y] == "2line") {
            lineCount += 2;
          }
          if (state[x - 1][y] == "line") {
            lineCount++;
          } else if (state[x - 1][y] == "2line") {
            lineCount += 2;
          }
          if (state[x][y + 1] == "line") {
            lineCount++;
          } else if (state[x][y + 1] == "2line") {
            lineCount += 2;
          }
          if (state[x][y - 1] == "line") {
            lineCount++;
          } else if (state[x][y - 1] == "2line") {
            lineCount += 2;
          }
          if (lineCount == state[x][y] * 1) {
            solvedNumbers.push(x + "-" + y);
          }
        }
      }
    }
  }
  return solvedNumbers
};
function calculateBridgeCount(state, pairs) {
  var total = 0;
  for (j = 0; j < pairs.length; j++) {
    var pair = pairs[j];
    var temp = pair.split("/");
    var first = temp[0].split("-");
    var second = temp[1].split("-");
    var firstX = first[0] * 1;
    var firstY = first[1] * 1;
    var secondX = second[0] * 1;
    var secondY = second[1] * 1;
    var type = "none";
    if (firstX > secondX) {
      type = state[firstX - 1][firstY];
    } else if (firstX < secondX) {
      type = state[firstX + 1][firstY];
    } else if (firstY > secondY) {
      type = state[firstX][firstY - 1];
    } else if (firstY < secondY) {
      type = state[firstX][firstY + 1];
    }
    if (type == "line") {
      total++;
    } else if (type == "2line") {
      total += 2;
    }
  }
  total = total / 2;
  return total;
};
function generateBridges(w, h) {
  var width = w;
  var height = h;
  var generateState = new Array((height * 2) + 1);

  var numbersArray = new Array();
  var continueCells = new Array();

  var generateCount = 0;
  var lastDirection = "none";
  for (var i = 0; i <= (height * 2); i++) {
    generateState[i] = new Array((width * 2) + 1);
  }
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 == 1) && (x % 2 == 1)) {
        generateState[x][y] = "nonumber";
      } else if (y % 2 == 1 && x % 2 != 1) {
        generateState[x][y] = "noline";
      } else if (x % 2 == 1 && y % 2 != 1) {
        generateState[x][y] = "noline";
      } else {
        generateState[x][y] = "dot";
      }
    }
  }
  var oldX = "none";
  var oldY = "none";
  var x = Math.floor(Math.random() * height + 1) * 2 - 1;
  var y = Math.floor(Math.random() * width + 1) * 2 - 1;
  // console.log(x + "-" + y);
  if (x == 3) {
    // x -= 2;
  }
  if (y == 3) {
    // y -= 2;
  }
  if (x == height * 2 - 3) {
    // x += 2;
  }
  if (y == width * 2 - 3) {
    // y += 2;
  }
  // console.log(x + "-" + y);
  var continueGenerating = true;
  var lastDirection = "none";
  var directions = [ "up", "down", "left", "right" ];

  while (continueGenerating == true) {
    if (continueCells.indexOf(x + "-" + y) == -1) {
      continueCells.push(x + "-" + y);
    }
    // console.log(JSON.stringify(numbersArray));
    // console.log(JSON.stringify(continueCells));

    generateCount++;
    if (generateCount > (width * height) * 20) {
      // continueGenerating = false;
    }
    if (numbersArray.length > (width * height) / 3) {
      // continueGenerating = false;
    }

    if (numbersArray.indexOf(x + "-" + y) == -1) {
      var numberOfLines = Math.floor((Math.random() * 3)) + 1;
      // console.log(numberOfLines);
      // postMessage("adding_" + x + "-" + y);
      // console.log("adding " + x + "-" + y);
      // console.log("old " + oldX + "-" + oldY);
      numbersArray.push(x + "-" + y);

      generateState[x][y] = "number";
      if (oldX != "none") {
        var type = "line";
        if (numberOfLines == 2) {
          type = "2line";
        }
        if (oldX > x) {
          for (i = oldX - 1; i > x; i -= 2) {
            generateState[i][y] = type;
          }
        } else if (oldX < x) {
          for (i = oldX + 1; i < x; i += 2) {
            generateState[i][y] = type;
          }
        } else if (oldY > y) {
          for (i = oldY - 1; i > y; i -= 2) {
            generateState[x][i] = type;
          }
        } else if (oldY < y) {
          for (i = oldY + 1; i < y; i += 2) {
            generateState[x][i] = type;
          }
        }
      }
    } else if (oldX != "none") {

      var numberOfLines = Math.floor((Math.random() * 3)) + 1;
      // console.log(numberOfLines);

      generateState[x][y] = "number";
      if (oldX != "none") {
        var type = "line";
        if (numberOfLines == 2) {
          type = "2line";
        }
        if (oldX > x) {
          for (i = oldX - 1; i > x; i -= 2) {
            generateState[i][y] = type;
          }
        } else if (oldX < x) {
          for (i = oldX + 1; i < x; i += 2) {
            generateState[i][y] = type;
          }
        } else if (oldY > y) {
          for (i = oldY - 1; i > y; i -= 2) {
            generateState[x][i] = type;
          }
        } else if (oldY < y) {
          for (i = oldY + 1; i < y; i += 2) {
            generateState[x][i] = type;
          }
        }
      }
    }

    var chanceOfRandomize = Math.floor((Math.random() * 3));
    chanceOfRandomize = 1;
    if (chanceOfRandomize == 1) {
      continueCells = shuffle(continueCells);
      var newSeedCell = continueCells[0].split("-");
      x = newSeedCell[0] * 1;
      y = newSeedCell[1] * 1;
      oldX = "none";
      oldY = "none";
      lastDirection = "none";
    }
    // directions = shuffle(directions);
    var maxDirectionCount;
    var possibleNewCells = new Array();
    var plainNewCells = new Array();
    var reachedLine = false;
    var reachedNumber = false;
    var notAlongLine = Math.floor((Math.random() * 2));
    notAlongLine = 0;
    var makingLoop = Math.floor((Math.random() * 2));
    // makingLoop = 1;
    // if(lastDirection != "up"){
    for (x2 = x - 1; x2 > 0; x2--) {
      if (x2 % 2 == 0) {

      } else {
        if (generateState[x2][y - 1] == "line" ||
            generateState[x2][y - 1] == "2line") {
          reachedLine = true;
        }
        // prevents placing numbers along already made connection
        if (generateState[x2 - 1][y] == "line" ||
            generateState[x2 - 1][y] == "2line") {
          if (notAlongLine == 1) {
            reachedLine = true;
          }
        }
        if (reachedLine == false) {
          if (numbersArray.indexOf(x2 + "-" + y) != -1 && x2 != x) {
            reachedNumber = true;
            if (generateState[x2 + 1][y] == "noline" && makingLoop == 1) {
              possibleNewCells.push(x2 + "-" + y);
            }
          } else {
            if (reachedNumber == false) {
              if (numbersArray.indexOf((x2 + 2) + "-" + y) == -1 &&
                  numbersArray.indexOf((x2 - 2) + "-" + y) == -1 &&
                  numbersArray.indexOf(x2 + "-" + (y + 2)) == -1 &&
                  numbersArray.indexOf(x2 + "-" + (y - 2)) == -1) {
                possibleNewCells.push(x2 + "-" + y);
              }
            }
          }
        }
      }
    }
    //}
    reachedLine = false;
    reachedNumber = false;
    // if(lastDirection != "down"){
    for (x2 = x + 1; x2 < height * 2; x2++) {
      if (x2 % 2 == 0) {

      } else {
        if (generateState[x2][y - 1] == "line" ||
            generateState[x2][y - 1] == "2line") {
          reachedLine = true;
        }
        if (generateState[x2 - 1][y] == "line" ||
            generateState[x2 - 1][y] == "2line") {
          if (notAlongLine == 1) {
            reachedLine = true;
          }
        }
        if (reachedLine == false) {
          if (numbersArray.indexOf(x2 + "-" + y) != -1 && x2 != x) {
            reachedNumber = true;
            if (generateState[x2 - 1][y] == "noline" && makingLoop == 1) {
              possibleNewCells.push(x2 + "-" + y);
            }
          } else {
            if (reachedNumber == false) {
              if (numbersArray.indexOf((x2 + 2) + "-" + y) == -1 &&
                  numbersArray.indexOf((x2 - 2) + "-" + y) == -1 &&
                  numbersArray.indexOf(x2 + "-" + (y + 2)) == -1 &&
                  numbersArray.indexOf(x2 + "-" + (y - 2)) == -1) {
                possibleNewCells.push(x2 + "-" + y);
              }
            }
          }
        }
      }
    }
    //}
    reachedLine = false;
    reachedNumber = false;
    // if(lastDirection != "left"){
    for (y2 = y - 1; y2 > 0; y2--) {
      if (y2 % 2 == 0) {

      } else {
        if (generateState[x - 1][y2] == "line" ||
            generateState[x - 1][y2] == "2line") {
          reachedLine = true;
        }
        if (generateState[x][y2 - 1] == "line" ||
            generateState[x][y2 - 1] == "2line") {
          if (notAlongLine == 1) {
            reachedLine = true;
          }
        }
        if (reachedLine == false) {
          if (numbersArray.indexOf(x + "-" + y2) != -1 && y != y2) {
            reachedNumber = true;
            if (generateState[x][y2 + 1] == "noline" && makingLoop == 1) {
              possibleNewCells.push(x + "-" + y2);
            }
          } else {
            if (reachedNumber == false) {
              if (numbersArray.indexOf((x + 2) + "-" + y2) == -1 &&
                  numbersArray.indexOf((x - 2) + "-" + y2) == -1 &&
                  numbersArray.indexOf(x + "-" + (y2 + 2)) == -1 &&
                  numbersArray.indexOf(x + "-" + (y2 - 2)) == -1) {
                possibleNewCells.push(x + "-" + y2);
              }
            }
          }
        }
      }
    }
    //}
    reachedLine = false;
    reachedNumber = false;
    // if(lastDirection != "right"){
    for (y2 = y + 1; y2 < width * 2; y2++) {
      if (y2 % 2 == 0) {

      } else {
        if (generateState[x - 1][y2] == "line" ||
            generateState[x - 1][y2] == "2line") {
          reachedLine = true;
        }
        if (generateState[x][y2 - 1] == "line" ||
            generateState[x][y2 - 1] == "2line") {
          if (notAlongLine == 1) {
            reachedLine = true;
          }
        }
        if (reachedLine == false) {
          if (numbersArray.indexOf(x + "-" + y2) != -1 && y != y2) {
            reachedNumber = true;
            if (generateState[x][y2 - 1] == "noline" && makingLoop == 1) {
              possibleNewCells.push(x + "-" + y2);
            }
          } else {
            if (reachedNumber == false) {
              if (numbersArray.indexOf((x + 2) + "-" + y2) == -1 &&
                  numbersArray.indexOf((x - 2) + "-" + y2) == -1 &&
                  numbersArray.indexOf(x + "-" + (y2 + 2)) == -1 &&
                  numbersArray.indexOf(x + "-" + (y2 - 2)) == -1) {
                possibleNewCells.push(x + "-" + y2);
              }
            }
          }
        }
      }
    }
    //}

    possibleNewCells = shuffle(possibleNewCells);

    for (var i = 0; i < possibleNewCells.length; i++) {

      var temp = possibleNewCells[i].split("-");
      var reorderX = temp[0] * 1;
      var reorderY = temp[1] * 1;

      var numberCount = 0;
      var vertCount = 0;
      var horCount = 0;
      for (x2 = reorderX; x2 > 0; x2--) {
        if (generateState[x2][reorderY] == "number") {
          numberCount++;
          vertCount++;
        }
      }
      for (x2 = reorderX; x2 < height * 2; x2++) {
        if (generateState[x2][reorderY] == "number") {
          numberCount++;
          vertCount++;
        }
      }
      for (y2 = reorderY; y2 > 0; y2--) {
        if (generateState[reorderX][y2] == "number") {
          numberCount++;
          horCount++;
        }
      }
      for (y2 = reorderY; y2 < width * 2; y2++) {
        if (generateState[reorderX][y2] == "number") {
          numberCount++;
          horCount++;
        }
      }
      numberCount = numberCount + "";
      possibleNewCells[i] = reorderX + "-" + reorderY + "-" + numberCount +
                            "-" + vertCount + "-" + horCount;
    }

    // console.log(possibleNewCells);
    possibleNewCells.sort(function(a, b) {
      var temp = a.split("-");
      a = temp[2] * 1;
      a2 = temp[3] * 1;
      a3 = temp[4] * 1;
      var aLowest = a2;
      if (a2 > a3) {
        aLowest = a3;
      }
      var aAverage = (a2 + a3) / 2
      temp = b.split("-");
      b = temp[2] * 1;
      b2 = temp[3] * 1;
      b3 = temp[4] * 1;
      var bLowest = b2;
      if (b2 > b3) {
        bLowest = b3;
      }
      var bAverage = (b2 + b3) / 2
      var randomOrder = Math.floor((Math.random() * 44));
      randomOrder = 0;
      if (randomOrder == 1) {
        return bAverage - aAverage;
        // return bLowest - aLowest;
      } else {
        return aAverage - bAverage;
        // return aLowest - bLowest;
      }
    });
    for (var i = 0; i < possibleNewCells.length; i++) {

      var temp = possibleNewCells[i].split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      plainNewCells.push(tempX + "-" + tempY);
    }
    // console.log(possibleNewCells);

    var oldPossibleNewCells = possibleNewCells.slice(0);
    // deletes numbers going in same direction as previous direction
    var directionsArray = new Array();
    if (generateState[x - 1][y] == "line" ||
        generateState[x - 1][y] == "2line") {
      directionsArray.push("down");
    }
    if (generateState[x + 1][y] == "line" ||
        generateState[x + 1][y] == "2line") {
      directionsArray.push("up");
    }
    if (generateState[x][y - 1] == "line" ||
        generateState[x][y - 1] == "2line") {
      directionsArray.push("left");
    }
    if (generateState[x][y + 1] == "line" ||
        generateState[x][y + 1] == "2line") {
      directionsArray.push("right");
    }
    for (var i = possibleNewCells.length - 1; i > 0; i--) {

      var temp = possibleNewCells[i].split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      if (lastDirection == "up" || lastDirection == "down") {
        if (tempX < x) {
          possibleNewCells.splice(i, 1);
        }
      } else if (lastDirection == "down" || lastDirection == "up") {
        if (tempX > x) {
          possibleNewCells.splice(i, 1);
        }
      } else if (lastDirection == "left" || lastDirection == "right") {
        if (tempY < y) {
          possibleNewCells.splice(i, 1);
        }
      } else if (lastDirection == "right" || lastDirection == "left") {
        if (tempY > y) {
          possibleNewCells.splice(i, 1);
        }
      } else if (lastDirection == "none") {
        if (tempX > x && (directionsArray.indexOf("up") == -1 ||
                          directionsArray.indexOf("down") == -1)) {
          possibleNewCells.splice(i, 1);
        }
        if (tempX < x && (directionsArray.indexOf("up") == -1 ||
                          directionsArray.indexOf("down") == -1)) {
          possibleNewCells.splice(i, 1);
        }
        if (tempY < y && (directionsArray.indexOf("right") == -1 ||
                          directionsArray.indexOf("left") == -1)) {
          possibleNewCells.splice(i, 1);
        }
        if (tempY > y && (directionsArray.indexOf("right") == -1 ||
                          directionsArray.indexOf("left") == -1)) {
          possibleNewCells.splice(i, 1);
        }
      }
    }

    // deletes numbers traveling along edge

    for (var i = possibleNewCells.length - 1; i > 0; i--) {

      var temp = possibleNewCells[i].split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      if (x == 1 && tempX == 1) {
        possibleNewCells.splice(i, 1);
      } else if (x == (height * 2) - 1 && tempX == (height * 2) - 1) {
        possibleNewCells.splice(i, 1);
      } else if (y == 1 && tempY == 1) {
        possibleNewCells.splice(i, 1);
      } else if (y == (width * 2) - 1 && tempY == (width * 2) - 1) {
        possibleNewCells.splice(i, 1);
      }
    }
    if (possibleNewCells.length == 0) {
      possibleNewCells = oldPossibleNewCells.slice(0);
    }

    // places numbers closer to edge if possible
    if (possibleNewCells.length > 0) {
      var temp = possibleNewCells[0].split("-");
      var newX = temp[0] * 1;
      var newY = temp[1] * 1;
      /*
      var chanceToHitEdge = Math.floor((Math.random()*2));
      chanceToHitEdge = 0;
      if(chanceToHitEdge == 0){
              if(newX == 3){
                      if(plainNewCells.indexOf(1 + "-" + newY) != -1){
                              newX = 1;
                      }
              }
              if(newX == height * 2 - 3){
                      if(plainNewCells.indexOf((height * 2 - 1) + "-" +
      newY) != -1){ newX = height * 2 - 1;
                      }
              }
              if(newY == 3){
                      if(plainNewCells.indexOf(newX + "-" + 1) != -1){
                              newY = 1;
                      }
              }
              if(newY == width * 2 - 3){
                      if(plainNewCells.indexOf(newX + "-" + (width * 2 - 1))
      != -1){ newY = width * 2 - 1;
                      }
              }
      }*/

      oldX = x * 1;
      oldY = y * 1;
      x = newX * 1;
      y = newY * 1;
      if (x > oldX) {
        lastDirection = "down";
      } else if (x < oldX) {
        lastDirection = "up";
      } else if (y > oldY) {
        lastDirection = "right";
      } else if (y < oldY) {
        lastDirection = "left";
      }

    } else {
      continueCells.splice(continueCells.indexOf(x + "-" + y), 1);
      continueCells = shuffle(continueCells);
      if (continueCells.length != 0) {
        var newSeedCell = continueCells[0].split("-");
        x = newSeedCell[0] * 1;
        y = newSeedCell[1] * 1;

        // console.log(x + "-" + y);
        oldX = "none";
        oldY = "none";
      } else {
        // console.log("FUCK");
        continueGenerating = false;
      }
    }
  }
  // console.log(continueCells);
  // console.log(generateState);

  return generateState;
};

function stringShortener(puzzleString) {
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaaaaaaaa").join("z");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaaaaaaa").join("y");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaaaaaa").join("x");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaaaaa").join("w");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaaaa").join("v");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaaa").join("u");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaaa").join("t");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaaa").join("s");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaaa").join("r");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaaa").join("q");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaaa").join("p");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaaa").join("o");
  puzzleString = puzzleString.split("aaaaaaaaaaaaaa").join("n");
  puzzleString = puzzleString.split("aaaaaaaaaaaaa").join("m");
  puzzleString = puzzleString.split("aaaaaaaaaaaa").join("l");
  puzzleString = puzzleString.split("aaaaaaaaaaa").join("k");
  puzzleString = puzzleString.split("aaaaaaaaaa").join("j");
  puzzleString = puzzleString.split("aaaaaaaaa").join("i");
  puzzleString = puzzleString.split("aaaaaaaa").join("h");
  puzzleString = puzzleString.split("aaaaaaa").join("g");
  puzzleString = puzzleString.split("aaaaaa").join("f");
  puzzleString = puzzleString.split("aaaaa").join("e");
  puzzleString = puzzleString.split("aaaa").join("d");
  puzzleString = puzzleString.split("aaa").join("c");
  puzzleString = puzzleString.split("aa").join("b");
  puzzleString = puzzleString.split("a").join("a");
  return puzzleString;
};
function checkSolution(puzzleState, width, height) {
  var isSolved = "true";
  // check each cell
  var lineCount = 0;
  var cellIncorrect = false;
  var lineIncorrect = false;
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      // console.log(x + "-" + y);
      lineCount = 0;
      if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] != "nonumber") {
        if (puzzleState[x + 1][y] == "line") {
          lineCount++;
        } else if (puzzleState[x + 1][y] == "2line") {
          lineCount += 2;
        }
        if (puzzleState[x - 1][y] == "line") {
          lineCount++;
        } else if (puzzleState[x - 1][y] == "2line") {
          lineCount += 2;
        }
        if (puzzleState[x][y + 1] == "line") {
          lineCount++;
        } else if (puzzleState[x][y + 1] == "2line") {
          lineCount += 2;
        }
        if (puzzleState[x][y - 1] == "line") {
          lineCount++;
        } else if (puzzleState[x][y - 1] == "2line") {
          lineCount += 2;
        }
        if (lineCount != puzzleState[x][y] * 1) {
          cellIncorrect = true;
        }
      }
    }
  }
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] == "nonumber") {
        if (puzzleState[x - 1][y] != "noline" &&
            puzzleState[x + 1][y] != "noline") {
          if (puzzleState[x][y - 1] != "noline" ||
              puzzleState[x][y + 1] != "noline") {
            lineIncorrect = true;
            // console.log("cross at " + x + "-" + y);
          }
        }
        if (puzzleState[x][y - 1] != "noline" &&
            puzzleState[x][y + 1] != "noline") {
          if (puzzleState[x - 1][y] != "noline" ||
              puzzleState[x + 1][y] != "noline") {
            lineIncorrect = true;
            // console.log("cross at " + x + "-" + y);
          }
        }
      }
    }
  }
  var visitedNumbers = new Array();
  var connectedGroups = new Array();
  // console.log(puzzleState);
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] != "nonumber" &&
          visitedNumbers.indexOf(x + "-" + y) == -1) {
        var connectedGroup = travelGroup(x, y, puzzleState, width, height);
        // console.log(connectedGroup);
        connectedGroups.push(connectedGroup);
        visitedNumbers.push.apply(visitedNumbers, connectedGroup);
      }
    }
  }
  // console.log(cellIncorrect);
  // console.log(connectedGroups);
  if (cellIncorrect == false && lineIncorrect == false &&
      connectedGroups.length <= 1) {
    isSolved = "true";
  } else {
    isSolved = "false";
  }
  return isSolved;
};
function travelGroup(xCoord, yCoord, puzzleState, width, height) {
  var visitedCells = new Array();
  var x = xCoord;
  var y = yCoord;
  var continueTraveling = true;
  while (continueTraveling == true) {
    if (visitedCells.indexOf(x + "-" + y) == -1) {
      visitedCells.push(x + "-" + y);
    }
    x = x * 1;
    y = y * 1;
    var connectedCell = "none";
    if ((puzzleState[x + 1][y] == "line" || puzzleState[x + 1][y] == "2line") &&
        connectedCell == "none") {
      connectedCell = travelLine(x, y, "down", puzzleState, width, height);
      if (visitedCells.indexOf(connectedCell) == -1) {
        //	var temp = connectedCell.split("-");
        //	x = temp[0] * 1;
        //	y = temp[1] * 1;
      } else {
        connectedCell = "none";
      }
    }
    if ((puzzleState[x - 1][y] == "line" || puzzleState[x - 1][y] == "2line") &&
        connectedCell == "none") {
      connectedCell = travelLine(x, y, "up", puzzleState, width, height);
      if (visitedCells.indexOf(connectedCell) == -1) {
        //	var temp = connectedCell.split("-");
        //	x = temp[0] * 1;
        //	y = temp[1] * 1;
      } else {
        connectedCell = "none";
      }
    }
    if ((puzzleState[x][y + 1] == "line" || puzzleState[x][y + 1] == "2line") &&
        connectedCell == "none") {
      connectedCell = travelLine(x, y, "right", puzzleState, width, height);
      if (visitedCells.indexOf(connectedCell) == -1) {
        //	var temp = connectedCell.split("-");
        //	x = temp[0] * 1;
        //	y = temp[1] * 1;
      } else {
        connectedCell = "none";
      }
    }
    if ((puzzleState[x][y - 1] == "line" || puzzleState[x][y - 1] == "2line") &&
        connectedCell == "none") {
      connectedCell = travelLine(x, y, "left", puzzleState, width, height);
      if (visitedCells.indexOf(connectedCell) == -1) {
        //	var temp = connectedCell.split("-");
        //	x = temp[0] * 1;
        //	y = temp[1] * 1;
      } else {
        connectedCell = "none";
      }
    }
    if (connectedCell != "none") {
      if (visitedCells.indexOf(connectedCell) == -1) {
        var temp = connectedCell.split("-");
        x = temp[0] * 1;
        y = temp[1] * 1;
      }
    } else {
      var index = visitedCells.indexOf(x + "-" + y);
      if (index != 0) {
        var lastCell = visitedCells[index - 1].split("-");
        x = lastCell[0] * 1;
        y = lastCell[1] * 1;

      } else {
        continueTraveling = false;
      }
    }
  }
  return visitedCells;
};
function travelLine(lineX, lineY, direction, puzzleState, width, height) {
  // console.log("LOL" + direction);
  var connectedCell;
  var foundCell = false;
  if (direction == "up") {
    for (i = lineX - 2; i > 0; i -= 2) {
      if (puzzleState[i][lineY] != "nonumber" && foundCell == false) {
        connectedCell = i + "-" + lineY;
        foundCell = true;
      }
    }
  } else if (direction == "down") {
    for (i = lineX + 2; i < height * 2; i += 2) {
      if (puzzleState[i][lineY] != "nonumber" && foundCell == false) {
        connectedCell = i + "-" + lineY;
        foundCell = true;
      }
    }
  } else if (direction == "right") {
    for (i = lineY + 2; i < width * 2; i += 2) {
      if (puzzleState[lineX][i] != "nonumber" && foundCell == false) {
        connectedCell = lineX + "-" + i;
        foundCell = true;
      }
    }
  } else if (direction == "left") {
    for (i = lineY - 2; i > 0; i -= 2) {
      if (puzzleState[lineX][i] != "nonumber" && foundCell == false) {
        connectedCell = lineX + "-" + i;
        foundCell = true;
      }
    }
  }
  // console.log(connectedCell);
  return connectedCell;
};

function solveObject(puzzleString, diff) {
  this.difficulty = diff;
  var puzzle = new puzzleObject(puzzleString);
  this.puzzleState = puzzle.getPuzzleState();
  this.width = puzzle.getWidth();
  this.height = puzzle.getHeight();
  solveObject.prototype.solve = function() {
    solveCount = 0;
    guessCount = 0;
    var accessibleNumbers =
        calculateAccessibleNumbers(this.width, this.height, this.puzzleState);
    var remainingLines = initRemainingLines(
        this.width, this.height, this.puzzleState, accessibleNumbers);
    var solveCount =
        solveLogic(this.width, this.height, this.puzzleState, accessibleNumbers,
                   remainingLines, new Array(), solveCount, this.difficulty);
    // console.log(solveCount);
    var solution = "";
    for (x = 0; x <= (this.height * 2); x++) {
      for (y = 0; y <= (this.width * 2); y++) {
        if (x % 2 == 0 && y % 2 == 0) {
          // solution += this.puzzleState[x][y] + "|" + colorState[x][y] +
          // "-";
          solution += this.puzzleState[x][y] + "-";
        } else {
          solution += this.puzzleState[x][y] + "-";
        }
      }
    }
    var isSolved = checkSolution(this.puzzleState, this.width, this.height);
    // var isSolved = false;
    this.solutionString = isSolved + "_" + solveCount + "_" + solution;
  };
  solveObject.prototype.getSolution =
      function() { return this.solutionString; };
  solveObject.prototype.getSolutionState =
      function() { return this.puzzleState; };
};
function initRemainingLines(width, height, puzzleState, accessibleNumbers) {
  var remainingLines = {};
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 != 0) && (x % 2 != 0)) {
        if (puzzleState[x][y] != "nonumber") {
          remainingLines[x + "-" + y] = puzzleState[x][y] * 1;
        }
      }
    }
  }
  // console.log(remainingLines);
  return remainingLines;
};
function recalculateRemainingLines(width, height, puzzleState, remainingLines,
                                   unfinishedNumbers) {
  for (var i = 0; i < unfinishedNumbers.length; i++) {
    var temp = unfinishedNumbers[i].split("-");
    var x = temp[0] * 1;
    var y = temp[1] * 1;
    var lineCount = 0;

    if (puzzleState[x + 1][y] == "line") {
      lineCount++;
    } else if (puzzleState[x + 1][y] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x - 1][y] == "line") {
      lineCount++;
    } else if (puzzleState[x - 1][y] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x][y + 1] == "line") {
      lineCount++;
    } else if (puzzleState[x][y + 1] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x][y - 1] == "line") {
      lineCount++;
    } else if (puzzleState[x][y - 1] == "2line") {
      lineCount += 2;
    }
    remainingLines[unfinishedNumbers[i]] = (puzzleState[x][y] * 1) - lineCount;
  }
  // console.log(remainingLines);
  return remainingLines;
};
function recalculateUnfinishedNumbers(width, height, puzzleState,
                                      unfinishedNumbers) {
  for (i = unfinishedNumbers.length - 1; i >= 0; i--) {
    var temp = unfinishedNumbers[i].split("-");
    var x = temp[0] * 1;
    var y = temp[1] * 1;
    var lineCount = 0;

    if (puzzleState[x + 1][y] == "line") {
      lineCount++;
    } else if (puzzleState[x + 1][y] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x - 1][y] == "line") {
      lineCount++;
    } else if (puzzleState[x - 1][y] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x][y + 1] == "line") {
      lineCount++;
    } else if (puzzleState[x][y + 1] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x][y - 1] == "line") {
      lineCount++;
    } else if (puzzleState[x][y - 1] == "2line") {
      lineCount += 2;
    }

    if (puzzleState[x][y] == lineCount) {
      // console.log("removing " + x + "-" + y);
      unfinishedNumbers.splice(i, 1);
    }
  }
  return unfinishedNumbers;
};
function calculateAccessibleNumbers(width, height, puzzleState) {
  var accessibleNumbers = {};
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 != 0) && (x % 2 != 0)) {
        if (puzzleState[x][y] != "nonumber") {

          accessibleNumbers[x + "-" + y] = new Array();

          var foundNumber = false;
          for (i = x; i <= (height * 2); i += 2) {
            if (foundNumber == false && (i + "-" + y) != (x + "-" + y)) {
              if (puzzleState[i][y] != "nonumber") {
                accessibleNumbers[x + "-" + y].push(i + "-" + y);
                foundNumber = true;
              }
            }
          }
          foundNumber = false;
          for (i = x; i > 0; i -= 2) {
            if (foundNumber == false && (i + "-" + y) != (x + "-" + y)) {
              if (puzzleState[i][y] != "nonumber") {
                accessibleNumbers[x + "-" + y].push(i + "-" + y);
                foundNumber = true;
              }
            }
          }
          foundNumber = false;
          for (i = y; i <= (width * 2); i += 2) {
            if (foundNumber == false && (x + "-" + i) != (x + "-" + y)) {
              if (puzzleState[x][i] != "nonumber") {
                accessibleNumbers[x + "-" + y].push(x + "-" + i);
                foundNumber = true;
              }
            }
          }
          foundNumber = false;
          for (i = y; i > 0; i -= 2) {
            if (foundNumber == false && (x + "-" + i) != (x + "-" + y)) {
              if (puzzleState[x][i] != "nonumber") {
                accessibleNumbers[x + "-" + y].push(x + "-" + i);
                foundNumber = true;
              }
            }
          }
        }
      }
    }
  }
  // console.log(accessibleNumbers);
  return accessibleNumbers;
};
function recalculateAccessibleNumbers(width, height, puzzleState,
                                      accessibleNumbers, unfinishedNumbers,
                                      exception) {
  // console.log(accessibleNumbers.length);
  // for (k = 0; k < accessibleNumbers.length; k++){

  //}
  // console.log(unfinishedNumbers);
  Object.keys(accessibleNumbers).forEach(function(number) {
    var temp = number.split("-");
    var startX = temp[0] * 1;
    var startY = temp[1] * 1;
    var currentAccessibleNumbers = accessibleNumbers[number];
    if (unfinishedNumbers.indexOf(number) == -1) {
      // console.log("finished " + number);
      for (k = currentAccessibleNumbers.length - 1; k >= 0; k--) {
        var spliceNumber = currentAccessibleNumbers[k];
        // currentAccessibleNumbers.splice(k, 1);
        var otherNumberArray = accessibleNumbers[spliceNumber];
        var index = otherNumberArray.indexOf(number);
        // console.log("removing " + number + " from " + otherNumberArray +
        // " for " + spliceNumber + " at " +
        // otherNumberArray.indexOf(number));
        if (index != -1) {
          // otherNumberArray.splice(otherNumberArray.indexOf(number), 1);
        }
      }
    }
    for (k = currentAccessibleNumbers.length - 1; k >= 0; k--) {

      temp = currentAccessibleNumbers[k].split("-")
      var endX = temp[0] * 1;
      var endY = temp[1] * 1;
      var foundLine = false;
      if (startX > endX) {
        for (i = startX - 1; i > endX; i--) {
          if (puzzleState[i][endY - 1] != "noline" &&
              puzzleState[i][endY - 1] != "dot") {
            foundLine = true;
            // console.log("FOUND");
          }
        }
      } else if (startX < endX) {
        for (i = startX + 1; i < endX; i++) {
          if (puzzleState[i][endY - 1] != "noline" &&
              puzzleState[i][endY - 1] != "dot") {
            foundLine = true;
            // console.log("FOUND");
          }
        }
      } else if (startY > endY) {
        for (i = startY - 1; i > endY; i--) {
          if (puzzleState[endX - 1][i] != "noline" &&
              puzzleState[endX - 1][i] != "dot") {
            foundLine = true;
            // console.log("FOUND");
          }
        }
      } else if (startY < endY) {
        for (i = startY + 1; i < endY; i++) {
          if (puzzleState[endX - 1][i] != "noline" &&
              puzzleState[endX - 1][i] != "dot") {
            foundLine = true;
            // console.log("FOUND");
          }
        }
      }
      if (foundLine == true) {
        // console.log("removing " + currentAccessibleNumbers[k] + " from "
        // + number)
        currentAccessibleNumbers.splice(k, 1);
      }
    }
    // console.log(number, accessibleNumbers[number]);
  });
  return accessibleNumbers
};
function solveLogic(w, h, puzzleState, accessibleNumbers, remainingLines,
                    singleLines, sCount, difficulty) {
  var guessCount = 0;
  var guessLimit = 0;
  var guessDepth = 0;
  if (difficulty == "hard") {
    guessLimit = 3;
    guessDepth = 3;
  }
  if (difficulty == "max") {
    guessLimit == 0
    guessDepth == 0
  }

  width = w;
  height = h;
  var unfinishedNumbers = new Array();
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if (x % 2 != 0 && y % 2 != 0) {
        if (puzzleState[x][y] != "nonumber") {
          unfinishedNumbers.push(x + "-" + y);
        }
      }
    }
  }

  var cont = true;
  while (cont == true) {

    // check for finished cells
    // unfinishedCells = checkCells(width, height, puzzleState,
    // unfinishedCells);

    var oldPuzzleState = new Array((height * 2) + 1);
    for (var i = 0; i <= (height * 2); i++) {
      oldPuzzleState[i] = new Array((width * 2) + 1);
    }
    for (x = 0; x <= (height * 2); x++) {
      for (y = 0; y <= (width * 2); y++) {
        oldPuzzleState[x][y] = puzzleState[x][y];
      }
    }
    // var oldAccessibleNumbers = accessibleNumbers.splice(0);
    var oldAccessibleNumbers = JSON.parse(JSON.stringify(accessibleNumbers));
    var oldUnfinishedNumbers = unfinishedNumbers.slice(0);
    var oldRemainingLines = JSON.parse(JSON.stringify(remainingLines));
    var oldSingleLines = JSON.parse(JSON.stringify(singleLines));
    // recalculates accessible numbers, lines, and numbers
    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers = recalculateAccessibleNumbers(
        w, h, puzzleState, accessibleNumbers, unfinishedNumbers, "none");

    postMessage("count_" + sCount);

    // puzzleState = oneRemainingLine(w, h, puzzleState, unfinishedNumbers,
    // accessibleNumbers, remainingLines);

    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers = recalculateAccessibleNumbers(
        w, h, puzzleState, accessibleNumbers, unfinishedNumbers, "none");

    puzzleState = maxLines(w, h, puzzleState, unfinishedNumbers,
                           accessibleNumbers, remainingLines, singleLines);

    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers = recalculateAccessibleNumbers(
        w, h, puzzleState, accessibleNumbers, unfinishedNumbers, "none");

    puzzleState = subMaxLines(w, h, puzzleState, unfinishedNumbers,
                              accessibleNumbers, remainingLines, singleLines);
    if (difficulty != "easy") {

      unfinishedNumbers =
          recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
      remainingLines = recalculateRemainingLines(
          w, h, puzzleState, remainingLines, unfinishedNumbers);
      accessibleNumbers = recalculateAccessibleNumbers(
          w, h, puzzleState, accessibleNumbers, unfinishedNumbers, "none");

      puzzleState = removeOneRemainingLines(
          w, h, puzzleState, unfinishedNumbers, accessibleNumbers,
          remainingLines, singleLines);
    }
    if (difficulty != "easy") {

      unfinishedNumbers =
          recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
      remainingLines = recalculateRemainingLines(
          w, h, puzzleState, remainingLines, unfinishedNumbers);
      accessibleNumbers = recalculateAccessibleNumbers(
          w, h, puzzleState, accessibleNumbers, unfinishedNumbers, "none");

      puzzleState =
          closedGroupIfRemoved(w, h, puzzleState, unfinishedNumbers,
                               accessibleNumbers, remainingLines, singleLines);
    }

    if (difficulty != "easy") {
      unfinishedNumbers =
          recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
      remainingLines = recalculateRemainingLines(
          w, h, puzzleState, remainingLines, unfinishedNumbers);
      accessibleNumbers = recalculateAccessibleNumbers(
          w, h, puzzleState, accessibleNumbers, unfinishedNumbers, "none");
      var connectionsToRemove =
          avoidClosedGroups(w, h, puzzleState, unfinishedNumbers,
                            accessibleNumbers, remainingLines);
      // console.log(connectionsToRemove);
      for (k = 0; k < connectionsToRemove.length; k++) {
        var connection = connectionsToRemove[k].split("/");
        // var temp = connection[0].split("-");
        // var firstX = temp[0] * 1;
        // var firstY = temp[1] * 1;
        // temp = connection[1].split("-");
        // var secondX = temp[0] * 1;
        // var secondY = temp[1] * 1;
        var currentAccessibleNumbers = accessibleNumbers[connection[0]];
        var index = currentAccessibleNumbers.indexOf(connection[1]);
        if (index != -1) {

          if (connection[2] == "remove") {
            currentAccessibleNumbers.splice(index, 1);
          } else {
            singleLines.push(connection[0] + "/" + connection[1]);
          }
        }
      }
    }

    // console.log(remainingLines);
    var isSolved = checkSolution(puzzleState, width, height);
    if (isSolved == "true") {
      sCount++;
      cont = false;
    } else {

      // var isValid = validateCells(puzzleState, w, h);
      isValid = true;
      if (isValid == true) {

        // checks for changes in puzzle state, continues if there are some
        if ((JSON.stringify(puzzleState) != JSON.stringify(oldPuzzleState) ||
             JSON.stringify(accessibleNumbers) !=
                 JSON.stringify(oldAccessibleNumbers) ||
             JSON.stringify(unfinishedNumbers) !=
                 JSON.stringify(oldUnfinishedNumbers) ||
             JSON.stringify(remainingLines) !=
                 JSON.stringify(oldRemainingLines)) &&
            sCount < 100) {
          sCount++;
          // postMessage(JSON.stringify(puzzleState) + " " +
          // JSON.stringify(oldPuzzleState));

          cont = true;
        } else {
          // console.log(accessibleNumbers);

          if (guessCount < guessLimit) {
            guessCount++;

            var oldAccessibleNumbers =
                JSON.parse(JSON.stringify(accessibleNumbers));
            var oldUnfinishedNumbers = unfinishedNumbers.slice(0);
            var oldRemainingLines = JSON.parse(JSON.stringify(remainingLines));
            var oldSingleLines = JSON.parse(JSON.stringify(singleLines));
            // puzzleState = startGuess(w, h, puzzleState, unfinishedCells);
            var connectionsToRemove =
                startGuess(width, height, puzzleState, oldUnfinishedNumbers,
                           oldAccessibleNumbers, oldRemainingLines,
                           oldSingleLines, guessDepth);
            // var connectionsToRemove = new Array();
            if (connectionsToRemove.length > 0) {
              sCount += 2;
              for (k = 0; k < connectionsToRemove.length; k++) {
                var connectionToRemove = connectionsToRemove[k].split("/");
                var temp = connectionToRemove[0].split("-");
                var startX = temp[0] * 1;
                var startY = temp[1] * 1;
                var temp = connectionToRemove[1].split("-");
                var endX = temp[0] * 1;
                var endY = temp[1] * 1;
                console.log("adding " + connectionsToRemove[k]);
                puzzleState = modifyState(startX, startY, endX, endY, "line",
                                          puzzleState);
                // var index =
                // accessibleNumbers[connectionToRemove[0]].indexOf(connectionToRemove[1]);
                // console.log(accessibleNumbers);
                // accessibleNumbers[connectionToRemove[0]].splice(index,
                // 1); console.log(accessibleNumbers);
              }
              cont = true;
            }
            console.log("WHAT" + guessCount);
          } else {
            cont = false;
          }
        }
      } else {
        postMessage("error");
        cont = false;
      }
    }
  }
  return sCount;
};
function closedGroupIfRemoved(width, height, puzzleState, unfinishedNumbers,
                              accessibleNumbers, remainingLines, singleLines) {
  for (k = 0; k < unfinishedNumbers.length; k++) {
    var neededConnections;
    var currentNumber = unfinishedNumbers[k];
    var temp = currentNumber.split("-");
    var currentX = temp[0] * 1;
    var currentY = temp[1] * 1;
    var currentTotal = puzzleState[currentX][currentY] * 1;

    var currentAccessibleNumbers = accessibleNumbers[currentNumber];
    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      // var otherTotals = new Array();
      var otherTotal = 0;
      var numberToConnect = "";
      for (m = 0; m < currentAccessibleNumbers.length; m++) {
        if (m != l) {
          var temp = currentAccessibleNumbers[m].split("-");
          var tempX = temp[0] * 1;
          var tempY = temp[1] * 1;
          var tempTotal = puzzleState[tempX][tempY] * 1;
          // console.log(tempTotal);
          // otherTotals.push(tempTotal);
          otherTotal = otherTotal + tempTotal;
          // console.log(otherTotal);
        } else {
          numberToConnect = currentAccessibleNumbers[m];
        }
      }
      if (otherTotal <= currentTotal) {
        var temp = numberToConnect.split("-");
        var connectX = temp[0] * 1;
        var connectY = temp[1] * 1;
        // console.log("lol " + currentNumber + " " + numberToConnect + " "
        // + tempTotal);
        puzzleState = modifyState(currentX, currentY, connectX, connectY,
                                  "line", puzzleState);
      }
    }

    /*
    var currentAccessibleNumbers = accessibleNumbers[currentNumber];
    var temp = currentAccessibleNumbers[0].split("-");
    var x1 = temp[0] * 1;
    var y1 = temp[1] * 1;
    temp = currentAccessibleNumbers[1].split("-");
    var x2 = temp[0] * 1;
    var y2 = temp[1] * 1;
    temp = currentAccessibleNumbers[2].split("-");
    var x3 = temp[0] * 1;
    var y3 = temp[1] * 1;
    var total1 = puzzleState[x1][y1] * 1;
    var total2 = puzzleState[x2][y2] * 1;
    var total3 = puzzleState[x3][y3] * 1;
    if(total1 + total2 <= currentTotal){
            console.log("lol " + currentAccessibleNumbers[2] + " " +
    currentNumber); puzzleState = modifyState(currentX, currentY, x3, y3,
    "line", puzzleState);
    }
    if(total1 + total3 <= currentTotal){
            console.log("lol2 " + currentAccessibleNumbers[1] + " " +
    currentNumber); puzzleState = modifyState(currentX, currentY, x2, y2,
    "line", puzzleState);
    }
    if(total2 + total3 <= currentTotal){
            console.log("lol3 " + currentAccessibleNumbers[0] + " " +
    currentNumber); puzzleState = modifyState(currentX, currentY, x1, y1,
    "line", puzzleState);
    }*/
  }
  return puzzleState;
};
function avoidClosedGroups(width, height, puzzleState, unfinishedNumbers,
                           accessibleNumbers, remainingLines) {
  var connectedGroups = new Array();
  var visitedNumbers = new Array();
  var connectionsToRemove = new Array();
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      if ((y % 2 != 0) && (x % 2 != 0) && puzzleState[x][y] != "nonumber" &&
          visitedNumbers.indexOf(x + "-" + y) == -1) {
        var connectedGroup = travelGroup(x, y, puzzleState, width, height);
        // console.log(connectedGroup);
        connectedGroups.push(connectedGroup);
        visitedNumbers.push.apply(visitedNumbers, connectedGroup);
      }
    }
  }
  var groupLinesRemaining = new Array();
  var groupNumbersRemaining = new Array();
  var groupLastNumbers = new Array();
  var groupUnfinishedNumbers = new Array();
  // console.log(remainingLines);
  if (connectedGroups.length > 2) {
    for (k = 0; k < connectedGroups.length; k++) {
      var currentUnfinishedNumbers = new Array();
      var currentGroup = connectedGroups[k];
      var totalLines = 0;
      var numbersRemaining = 0;
      var lastNumber = "none";
      for (l = 0; l < currentGroup.length; l++) {
        var currentNumber = currentGroup[l];
        // var temp = currentNumber.split("-");
        // var tempX = temp[0] * 1;
        // var tempY = temp[1] * 1;
        if (unfinishedNumbers.indexOf(currentNumber) != -1) {
          var remaining = remainingLines[currentNumber];
          if (remaining != 0) {
            // console.log(remaining);
            totalLines += remaining;
            numbersRemaining++;
            lastNumber = currentNumber;
            currentUnfinishedNumbers.push(currentNumber);
          }
        } else {
        }
      }
      groupLinesRemaining.push(totalLines);
      groupNumbersRemaining.push(numbersRemaining);
      groupLastNumbers.push(lastNumber);
      groupUnfinishedNumbers.push(currentUnfinishedNumbers);
    }
    for (k = 0; k < groupLinesRemaining.length; k++) {
      if (groupLinesRemaining[k] == 1) {
        // prevents line between two groups with one escape each
        var connectingNumber = groupLastNumbers[k];
        var possibleConnections = accessibleNumbers[connectingNumber];
        for (l = 0; l < possibleConnections.length; l++) {
          var currentConnection = possibleConnections[l];
          var index = groupLastNumbers.indexOf(currentConnection);
          if (index != -1) {
            if (groupLinesRemaining[index] == 1 &&
                groupNumbersRemaining[index] == 1) {
              // console.log("WOOOOOO");
              connectionsToRemove.push(connectingNumber + "/" +
                                       currentConnection + "/" +
                                       "remove");
            }
          }
        }
      } else if (groupLinesRemaining[k] == 2) {
        // prevents double line between two groups with two escapes each
        var connectingNumber = groupLastNumbers[k];
        var possibleConnections = accessibleNumbers[connectingNumber];
        for (l = 0; l < possibleConnections.length; l++) {
          var currentConnection = possibleConnections[l];
          var index = groupLastNumbers.indexOf(currentConnection);
          if (index != -1) {
            if (groupLinesRemaining[index] == 2 &&
                groupNumbersRemaining[index] == 1) {
              // console.log("WOOOOOO");
              // console.log(connectingNumber + "/" + currentConnection);
              connectionsToRemove.push(connectingNumber + "/" +
                                       currentConnection + "/" +
                                       "one");
            }
          }
        }

        // prevents double line where it would finish closed group
        if (groupNumbersRemaining[k] == 2) {
          var connectingNumber = groupLastNumbers[k];
          var currentNumber = groupUnfinishedNumbers[k][0];
          // var possibleConnections = accessibleNumbers[connectingNumber];
          if (connectingNumber == currentNumber) {
            currentNumber = groupUnfinishedNumbers[k][1];
          }
          var lineState = getLineState(width, height, puzzleState,
                                       currentNumber, connectingNumber);

          if (lineState == "line") {
            // console.log("OH NO");
            connectionsToRemove.push(connectingNumber + "/" + currentNumber +
                                     "/" +
                                     "one");
            connectionsToRemove.push(currentNumber + "/" + connectingNumber +
                                     "/" +
                                     "one");
          }
        }
      }
    }
  }
  // console.log(connectedGroups);
  // console.log(groupLinesRemaining);
  // console.log(groupNumbersRemaining);
  // console.log(groupLastNumbers);
  // console.log(connectionsToRemove);
  // return puzzleState;
  return connectionsToRemove;
};
function getLineState(width, height, puzzleState, number1, number2) {
  var temp = number1.split("-");
  var connectingX = temp[0] * 1;
  var connectingY = temp[1] * 1;
  temp = number2.split("-");
  var currentX = temp[0] * 1;
  var currentY = temp[1] * 1;
  var type = "noline"
  if (connectingX > currentX) {
    type = puzzleState[connectingX - 1][connectingY];
  }
  else if (connectingX < currentX) {
    type = puzzleState[connectingX + 1][connectingY];
  }
  else if (connectingY > currentY) {
    type = puzzleState[connectingX][connectingY - 1];
  }
  else if (connectingY < currentY) {
    type = puzzleState[connectingX][connectingY + 1];
  }
  return type;
}
function maxLines(width, height, puzzleState, unfinishedNumbers,
                  accessibleNumbers, remainingLines, singleLines) {
  // var lineCount;
  for (k = 0; k < unfinishedNumbers.length; k++) {
    var temp = unfinishedNumbers[k].split("-");
    var x = temp[0] * 1;
    var y = temp[1] * 1;
    // console.log(accessibleNumbers);
    // console.log(unfinishedNumbers[k]);
    // console.log(accessibleNumbers[unfinishedNumbers[k]]);
    var currentAccessibleNumbers = accessibleNumbers[unfinishedNumbers[k]];
    var currentNumber = puzzleState[x][y] * 1;
    var actuallyAccessibleNumbers = new Array();
    var actualRemainingLines = currentNumber;

    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      // console.log(currentAccessibleNumbers[l]);
      if (unfinishedNumbers.indexOf(currentAccessibleNumbers[l]) != -1) {
        var lineState =
            getLineState(width, height, puzzleState, unfinishedNumbers[k],
                         currentAccessibleNumbers[l]);
        // console.log(lineState);
        if (singleLines.indexOf(unfinishedNumbers[k] + "/" +
                                currentAccessibleNumbers[l]) != -1 &&
            lineState == "line") {
          // console.log("omitting" + currentAccessibleNumbers[l]);
        } else {
          actuallyAccessibleNumbers.push(currentAccessibleNumbers[l]);
        }
        // console.log(currentAccessibleNumbers + " " + unfinishedNumbers);
      }
    }

    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      if (actuallyAccessibleNumbers.indexOf(currentAccessibleNumbers[l]) ==
          -1) {
        temp = currentAccessibleNumbers[l].split("-");
        var tempX = temp[0] * 1;
        var tempY = temp[1] * 1;
        if (x > tempX) {
          if (puzzleState[x - 1][y] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x - 1][y] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (x < tempX) {
          if (puzzleState[x + 1][y] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x + 1][y] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (y > tempY) {
          if (puzzleState[x][y - 1] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x][y - 1] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (y < tempY) {
          if (puzzleState[x][y + 1] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x][y + 1] == "2line") {
            actualRemainingLines -= 2;
          }
        }
        if (singleLines.indexOf(unfinishedNumbers[k] + "/" +
                                currentAccessibleNumbers[l]) != -1) {
          actualRemainingLines--;
        }
      } else {
      }
    }
    // console.log(x + "-" + y + " " + remainingLines[unfinishedNumbers[k]]
    // + " " + actualRemainingLines) console.log(x + "-" + y + " " +
    // remainingLines[unfinishedNumbers[k]] + currentAccessibleNumbers);
    if (actuallyAccessibleNumbers.length * 2 == actualRemainingLines) {
      for (var j = 0; j < actuallyAccessibleNumbers.length; j++) {
        temp = actuallyAccessibleNumbers[j].split("-");
        var endX = temp[0] * 1;
        var endY = temp[1] * 1;
        puzzleState = modifyState(x, y, endX, endY, "2line", puzzleState);
      }
    }
    /*
    if(currentNumber == 1 && currentAccessibleNumbers.length ==
    currentNumber){

            for (var j = 0; j < currentAccessibleNumbers.length; j++) {
                    temp = currentAccessibleNumbers[j].split("-");
                    var endX = temp[0] * 1;
                    var endY = temp[1] * 1;
                    //puzzleState = modifyState(x, y, endX, endY, "plus1",
    puzzleState);
            }
    }*/
  }
  return puzzleState;
}
function subMaxLines(width, height, puzzleState, unfinishedNumbers,
                     accessibleNumbers, remainingLines, singleLines) {
  for (k = 0; k < unfinishedNumbers.length; k++) {
    var temp = unfinishedNumbers[k].split("-");
    var x = temp[0] * 1;
    var y = temp[1] * 1;
    // console.log(accessibleNumbers);
    // console.log(unfinishedNumbers[k]);
    // console.log(accessibleNumbers[unfinishedNumbers[k]]);
    var currentAccessibleNumbers = accessibleNumbers[unfinishedNumbers[k]];
    var currentNumber = puzzleState[x][y] * 1;
    var actuallyAccessibleNumbers = new Array();
    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      // console.log(currentAccessibleNumbers[l]);
      if (unfinishedNumbers.indexOf(currentAccessibleNumbers[l]) != -1) {
        var lineState =
            getLineState(width, height, puzzleState, unfinishedNumbers[k],
                         currentAccessibleNumbers[l]);
        // console.log(lineState);
        if (singleLines.indexOf(unfinishedNumbers[k] + "/" +
                                currentAccessibleNumbers[l]) != -1 &&
            lineState == "line") {
          // console.log("omitting" + currentAccessibleNumbers[l]);
        } else {
          actuallyAccessibleNumbers.push(currentAccessibleNumbers[l]);
        }
      }
    }
    var actualRemainingLines = currentNumber;
    var actualAvailableLines = 0;
    // var availableLinesArray = new Array();
    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      temp = currentAccessibleNumbers[l].split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      actualAvailableLines += remainingLines[currentAccessibleNumbers[l]];
      var isSingle = false;
      if (singleLines.indexOf(unfinishedNumbers[k] + "/" +
                              currentAccessibleNumbers[l]) != -1) {
        isSingle = true;
      }
      if (actuallyAccessibleNumbers.indexOf(currentAccessibleNumbers[l]) ==
          -1) {

        if (x > tempX) {
          if (puzzleState[x - 1][y] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x - 1][y] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (x < tempX) {
          if (puzzleState[x + 1][y] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x + 1][y] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (y > tempY) {
          if (puzzleState[x][y - 1] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x][y - 1] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (y < tempY) {
          if (puzzleState[x][y + 1] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x][y + 1] == "2line") {
            actualRemainingLines -= 2;
          }
        }
      }
    }
    // console.log(x + "-" + y + " " + remainingLines[unfinishedNumbers[k]]
    // + " " + actuallyAccessibleNumbers + " " + unfinishedNumbers);
    // console.log(actualAvailableLines + " " + x + "-" + y);
    if (actuallyAccessibleNumbers.length * 2 - 1 == actualRemainingLines) {

      for (var j = 0; j < actuallyAccessibleNumbers.length; j++) {
        temp = actuallyAccessibleNumbers[j].split("-");
        var endX = temp[0] * 1;
        var endY = temp[1] * 1;
        puzzleState = modifyState(x, y, endX, endY, "line", puzzleState);
        // console.log("WHOA" + x + "-" + y + " " + endX + "-" + endY);
      }
    }
  }
  return puzzleState;
}
function removeOneRemainingLines(width, height, puzzleState, unfinishedNumbers,
                                 accessibleNumbers, remainingLines,
                                 singleLines) {
  for (k = 0; k < unfinishedNumbers.length; k++) {
    var temp = unfinishedNumbers[k].split("-");
    var x = temp[0] * 1;
    var y = temp[1] * 1;
    // console.log(accessibleNumbers);
    // console.log(unfinishedNumbers[k]);
    // console.log(accessibleNumbers[unfinishedNumbers[k]]);
    var currentAccessibleNumbers = accessibleNumbers[unfinishedNumbers[k]];
    var currentNumber = puzzleState[x][y] * 1;
    var actuallyAccessibleNumbers = new Array();
    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      // console.log(currentAccessibleNumbers[l]);
      if (unfinishedNumbers.indexOf(currentAccessibleNumbers[l]) != -1) {
        actuallyAccessibleNumbers.push(currentAccessibleNumbers[l]);
        // console.log(currentAccessibleNumbers + " " + unfinishedNumbers);
      }
    }
    var actualRemainingLines = currentNumber;
    // var availableLinesArray = new Array();
    /*
    console.log(unfinishedNumbers[k]);
    console.log(currentAccessibleNumbers);
    console.log(actuallyAccessibleNumbers);
    */
    for (l = 0; l < currentAccessibleNumbers.length; l++) {
      temp = currentAccessibleNumbers[l].split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      if (actuallyAccessibleNumbers.indexOf(currentAccessibleNumbers[l]) ==
          -1) {
        if (x > tempX) {
          if (puzzleState[x - 1][y] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x - 1][y] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (x < tempX) {
          if (puzzleState[x + 1][y] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x + 1][y] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (y > tempY) {
          if (puzzleState[x][y - 1] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x][y - 1] == "2line") {
            actualRemainingLines -= 2;
          }
        } else if (y < tempY) {
          if (puzzleState[x][y + 1] == "line") {
            actualRemainingLines--;
          } else if (puzzleState[x][y + 1] == "2line") {
            actualRemainingLines -= 2;
          }
        }
      }
    }
    // console.log(x + "-" + y + " " + remainingLines[unfinishedNumbers[k]]
    // + " " + actuallyAccessibleNumbers + " " + unfinishedNumbers);
    // console.log(actuallyAccessibleNumbers);
    // console.log(currentAccessibleNumbers);
    // console.log(actualRemainingLines + " " + x + "-" + y);
    for (l = 0; l < actuallyAccessibleNumbers.length; l++) {
      var temp = actuallyAccessibleNumbers[l].split("-");
      var tempX = temp[0] * 1;
      var tempY = temp[1] * 1;
      var isSingle = false;
      // console.log(singleLines);
      if (singleLines.indexOf(unfinishedNumbers[k] + "/" +
                              actuallyAccessibleNumbers[l]) != -1) {
        // console.log("what");
        isSingle = true;
      }
      if (remainingLines[actuallyAccessibleNumbers[l]] == 1 ||
          isSingle == true) {
        if ((actuallyAccessibleNumbers.length - 1) * 2 ==
            actualRemainingLines) {
          // console.log(currentAccessibleNumbers);
          // console.log(actuallyAccessibleNumbers);
          for (var j = 0; j < actuallyAccessibleNumbers.length; j++) {
            if (l != j) {
              temp = actuallyAccessibleNumbers[j].split("-");
              var endX = temp[0] * 1;
              var endY = temp[1] * 1;
              var hasLine = false;
              if (x > tempX) {
                if (puzzleState[x - 1][y] == "line" ||
                    puzzleState[x - 1][y] == "2line") {
                  hasLine = true;
                }
              } else if (x < tempX) {
                if (puzzleState[x + 1][y] == "line" ||
                    puzzleState[x + 1][y] == "2line") {
                  hasLine = true;
                }
              } else if (y > tempY) {
                if (puzzleState[x][y - 1] == "line" ||
                    puzzleState[x][y - 1] == "2line") {
                  hasLine = true;
                }
              } else if (y < tempY) {
                if (puzzleState[x][y + 1] == "line" ||
                    puzzleState[x][y + 1] == "2line") {
                  hasLine = true;
                }
              }
              if (hasLine == false) {
                if (isSingle == true) {
                  ;
                  if (singleLines.indexOf(x + "-" + y + "/" + endX + "-" +
                                          endY) == -1) {
                    // console.log("LINE " + x + "-" + y + "/" + endX + "-"
                    // + endY);
                    puzzleState =
                        modifyState(x, y, endX, endY, "line", puzzleState);
                  }
                } else {
                  // console.log("LINE " + x + "-" + y + "/" + endX + "-" +
                  // endY);
                  puzzleState =
                      modifyState(x, y, endX, endY, "line", puzzleState);
                }
              }
            }
          }
        }
      }
    }
  }
  return puzzleState;
}
function oneRemainingLine(width, height, puzzleState, unfinishedNumbers,
                          accessibleNumbers, remainingLines) {
  // console.log(unfinishedNumbers);

  for (k = 0; k < unfinishedNumbers.length; k++) {
    var temp = unfinishedNumbers[k].split("-");
    var x = temp[0] * 1;
    var y = temp[1] * 1;

    if (remainingLines[unfinishedNumbers[k]] == 1 ||
        remainingLines[unfinishedNumbers[k]] == 2) {
      var currentAccessibleNumbers = accessibleNumbers[unfinishedNumbers[k]];
      var possibleEscapes = new Array();
      for (var j = 0; j < currentAccessibleNumbers.length; j++) {

        if (unfinishedNumbers.indexOf(currentAccessibleNumbers[j]) != -1) {

          possibleEscapes.push(currentAccessibleNumbers[j]);
        }
        // console.log(x + "-" + y);
        // console.log(currentAccessibleNumbers);
        // console.log(possibleEscapes);
      }
      if (possibleEscapes.length == 1 &&
          remainingLines[unfinishedNumbers[k]] == 1) {

        var temp = possibleEscapes[0].split("-");
        var endX = temp[0] * 1;
        var endY = temp[1] * 1;
        console.log("modifying at " + x + "-" + y);
        puzzleState = modifyState(x, y, endX, endY, "plus1", puzzleState);
      } else if (possibleEscapes.length == 1 &&
                 remainingLines[unfinishedNumbers[k]] == 2) {
        var temp = possibleEscapes[0].split("-");
        var endX = temp[0] * 1;
        var endY = temp[1] * 1;
        console.log("modifying at " + x + "-" + y);
        puzzleState = modifyState(x, y, endX, endY, "plus2", puzzleState);
      }
    }
  }
  return puzzleState;
}
function startGuess(width, height, puzzleState, unfinishedNumbers,
                    accessibleNumbers, remainingLines, singleLines,
                    guessDepth) {
  // change guess to not guess every line, but only valid configurations
  // around circles var addType = ""; var adding = false; if(guessType ==
  // "line"){ 	addType = "xline"; }else if(guessType == "xline"){ 	addType
  // =
  //"line";
  // }
  var connectionsToRemove = new Array();

  // console.log("starting guess");
  // checkForLoops(width, height, guessPuzzleState);

  var startPuzzleState = new Array((height * 2) + 1);
  for (var i = 0; i <= (height * 2); i++) {
    startPuzzleState[i] = new Array((width * 2) + 1);
  }
  for (x = 0; x <= (height * 2); x++) {
    for (y = 0; y <= (width * 2); y++) {
      startPuzzleState[x][y] = puzzleState[x][y];
    }
  }
  var startAccessibleNumbers = JSON.parse(JSON.stringify(accessibleNumbers));
  var startUnfinishedNumbers = unfinishedNumbers.slice(0);
  var startRemainingLines = JSON.parse(JSON.stringify(remainingLines));
  var startSingleLines = JSON.parse(JSON.stringify(singleLines));
  // removes connections from accessible numbers array for guess solving
  for (i = 0; i < startUnfinishedNumbers.length; i++) {
    var currentNumber = startUnfinishedNumbers[i];

    for (v = startAccessibleNumbers[currentNumber].length - 1; v >= 0; v--) {
      var currentGuessAccessibleNumber =
          startAccessibleNumbers[currentNumber][v];

      if (startUnfinishedNumbers.indexOf(currentGuessAccessibleNumber) != -1 &&
          startAccessibleNumbers[currentNumber].length > 1) {
        var temp = currentGuessAccessibleNumber.split("-");
        var guessX = temp[0] * 1;
        var guessY = temp[1] * 1;
        temp = currentNumber.split("-");
        var currentX = temp[0] * 1;
        var currentY = temp[1] * 1;
        var alreadyConnected = false;
        if (currentX < guessX) {
          if (startPuzzleState[currentX + 1][currentY] != "noline") {
            alreadyConnected = true;
          }
        } else if (currentX > guessX) {
          if (startPuzzleState[currentX - 1][currentY] != "noline") {
            alreadyConnected = true;
          }
        } else if (currentY > guessY) {
          if (startPuzzleState[currentX][currentY - 1] != "noline") {
            alreadyConnected = true;
          }
        } else if (currentY < guessY) {
          if (startPuzzleState[currentX][currentY + 1] != "noline") {
            alreadyConnected = true;
          }
        }
        if (alreadyConnected == false) {

          // console.log(JSON.stringify(accessibleNumbers).length);
          accessibleNumbers[currentNumber].splice(v, 1);
          // console.log(JSON.stringify(accessibleNumbers).length);
          var removedConnection =
              currentNumber + "/" + currentGuessAccessibleNumber;
          var doRemove = guessSolve(
              width, height, puzzleState, accessibleNumbers, remainingLines,
              singleLines, unfinishedNumbers, removedConnection, guessDepth);
          if (doRemove == "true") {
            connectionsToRemove.push(removedConnection);
            console.log(currentNumber + "-" + currentGuessAccessibleNumber);
            // console.log("removing " + removedConnection);
          }
          // accessibleNumbers[currentNumber][v] =
          // currentGuessAccessibleNumber;

          accessibleNumbers =
              JSON.parse(JSON.stringify(startAccessibleNumbers));
          // console.log(JSON.stringify(accessibleNumbers).length);
          unfinishedNumbers = startUnfinishedNumbers.slice(0);
          remainingLines = JSON.parse(JSON.stringify(startRemainingLines));
          singleLines = JSON.parse(JSON.stringify(startSingleLines));
          for (x = 0; x <= (height * 2); x++) {
            for (y = 0; y <= (width * 2); y++) {
              puzzleState[x][y] = startPuzzleState[x][y];
            }
          }
        }
      }
    }
  }
  // console.log("finished guessing");
  // console.log("what " + toAdd.length);
  // console.log(toAdd);
  console.log(connectionsToRemove);
  return connectionsToRemove;
}
function guessSolve(w, h, puzzleState, accessibleNumbers, remainingLines,
                    singleLines, unfinishedNumbers, removedConnection,
                    guessDepth) {
  var guessSolveCount = 0;
  var removeConnection = "false";
  while (guessSolveCount < guessDepth && removeConnection == "false") {
    // recalculates accessible numbers, lines, and numbers
    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers =
        recalculateAccessibleNumbers(w, h, puzzleState, accessibleNumbers,
                                     unfinishedNumbers, removedConnection);

    puzzleState = maxLines(w, h, puzzleState, unfinishedNumbers,
                           accessibleNumbers, remainingLines, singleLines);

    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers =
        recalculateAccessibleNumbers(w, h, puzzleState, accessibleNumbers,
                                     unfinishedNumbers, removedConnection);

    puzzleState = subMaxLines(w, h, puzzleState, unfinishedNumbers,
                              accessibleNumbers, remainingLines, singleLines);

    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers =
        recalculateAccessibleNumbers(w, h, puzzleState, accessibleNumbers,
                                     unfinishedNumbers, removedConnection);

    puzzleState =
        removeOneRemainingLines(w, h, puzzleState, unfinishedNumbers,
                                accessibleNumbers, remainingLines, singleLines);

    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers =
        recalculateAccessibleNumbers(w, h, puzzleState, accessibleNumbers,
                                     unfinishedNumbers, removedConnection);

    var connectionsToRemove =
        avoidClosedGroups(w, h, puzzleState, unfinishedNumbers,
                          accessibleNumbers, remainingLines);

    // console.log(connectionsToRemove);
    for (k = 0; k < connectionsToRemove.length; k++) {
      var connection = connectionsToRemove[k].split("/");
      var currentAccessibleNumbers = accessibleNumbers[connection[0]];
      var index = currentAccessibleNumbers.indexOf(connection[1]);
      if (index != -1) {

        if (connection[2] == "remove") {
          currentAccessibleNumbers.splice(index, 1);
        } else {
          singleLines.push(connection[0] + "/" + connection[1]);
        }
      }
    }

    unfinishedNumbers =
        recalculateUnfinishedNumbers(w, h, puzzleState, unfinishedNumbers);
    remainingLines = recalculateRemainingLines(
        w, h, puzzleState, remainingLines, unfinishedNumbers);
    accessibleNumbers =
        recalculateAccessibleNumbers(w, h, puzzleState, accessibleNumbers,
                                     unfinishedNumbers, removedConnection);

    var visitedNumbers = new Array();
    var connectedGroups = new Array();
    for (x = 0; x <= (height * 2); x++) {
      for (y = 0; y <= (width * 2); y++) {
        if ((y % 2 != 0) && (x % 2 != 0)) {
          if (puzzleState[x][y] != "nonumber") {

            if (visitedNumbers.indexOf(x + "-" + y) == -1) {
              var connectedGroup =
                  travelGroup(x, y, puzzleState, width, height);
              // console.log(connectedGroup);
              connectedGroups.push(connectedGroup);
              visitedNumbers.push.apply(visitedNumbers, connectedGroup);
            }

            if (remainingLines[x + "-" + y] < 0) {
              console.log("FUCK");
              removeConnection = "true";
            }
            if (unfinishedNumbers.indexOf(x + "-" + y) != -1 &&
                remainingLines[x + "-" + y] < 1) {
              console.log("FUCKU");
              removeConnection = "true";
            }
            if (accessibleNumbers[x + "-" + y].length <
                (puzzleState[x][y] * 1) / 2) {
              console.log("DICK");
              removeConnection = "true";
            }
          }
        }
      }
    }
    // console.log(connectedGroups);
    if (connectedGroups.length > 1) {
      var foundClosedGroup = false;

      for (j = 0; j < connectedGroups.length; j++) {
        var currentGroup = connectedGroups[j];
        var openGroup = false;
        for (k = 0; k < currentGroup.length; k++) {
          if (unfinishedNumbers.indexOf(currentGroup[k]) != -1) {
            openGroup = true;
          }
        }
      }
      if (openGroup == false) {
        foundClosedGroup = true;
      }

      if (foundClosedGroup == true) {
        console.log("OH SHIT");
        removeConnection = "true";
      }
    }

    guessSolveCount++;
  }
  return removeConnection;
}

function modifyState(startX, startY, destinationX, destinationY, type,
                     puzzleState) {
  // var type;
  if (startX > destinationX) {
    if (type == "plus1" || type == "plus2") {
      if (puzzleState[startX - 1][startY] == "noline" && type == "plus2") {
        type = "2line";
      } else if (puzzleState[startX - 1][startY] == "line" && type == "plus1") {
        type = "2line";
      } else if (puzzleState[startX - 1][startY] == "noline" &&
                 type == "plus1") {
        type = "line";
      } else if (puzzleState[startX - 1][startY] == "line" && type == "plus2") {
        type = "2line";
      } else {
        type = "none";
        console.log(puzzleState[startX - 1][startY])
      }
    }
    if (type == "line" && puzzleState[startX - 1][startY] == "2line") {
      type = "none";
    }
    if (puzzleState[startX - 1][y] != type) {
      for (i = startX - 1; i > destinationX; i -= 2) {
        if (type != "none") {
          puzzleState[i][startY] = type;
        }
      }
    }
  } else if (startX < destinationX) {
    if (type == "plus1" || type == "plus2") {
      if (puzzleState[startX + 1][startY] == "noline" && type == "plus2") {
        type = "2line";
      } else if (puzzleState[startX + 1][startY] == "line" && type == "plus1") {
        type = "2line";
      } else if (puzzleState[startX + 1][startY] == "noline" &&
                 type == "plus1") {
        type = "line";
      } else if (puzzleState[startX + 1][startY] == "line" && type == "plus2") {
        type = "2line";
      } else {
        type = "none";
        console.log(puzzleState[startX + 1][startY])
      }
    }
    if (type == "line" && puzzleState[startX + 1][startY] == "2line") {
      type = "none";
    }
    if (puzzleState[startX + 1][y] != type) {
      for (i = startX + 1; i < destinationX; i += 2) {
        if (type != "none") {
          puzzleState[i][startY] = type;
        }
      }
    }
  } else if (startY > destinationY) {
    if (type == "plus1" || type == "plus2") {
      if (puzzleState[startX][startY - 1] == "noline" && type == "plus2") {
        type = "2line";
      } else if (puzzleState[startX][startY - 1] == "line" && type == "plus1") {
        type = "2line";
      } else if (puzzleState[startX][startY - 1] == "noline" &&
                 type == "plus1") {
        type = "line";
      } else if (puzzleState[startX][startY - 1] == "line" && type == "plus2") {
        type = "2line";
      } else {
        type = "none";
        console.log(puzzleState[startX][startY - 1])
      }
    }
    if (type == "line" && puzzleState[startX][startY - 1] == "2line") {
      type = "none";
    }
    if (puzzleState[startX][y - 1] != type) {
      for (i = startY - 1; i > destinationY; i -= 2) {
        if (type != "none") {
          puzzleState[startX][i] = type;
        }
      }
    }
  } else if (startY < destinationY) {
    // console.log("ah" + type);
    if (type == "plus1" || type == "plus2") {
      if (puzzleState[startX][startY + 1] == "noline" && type == "plus2") {
        type = "2line";
      } else if (puzzleState[startX][startY + 1] == "line" && type == "plus1") {
        type = "2line";
      } else if (puzzleState[startX][startY + 1] == "noline" &&
                 type == "plus1") {
        type = "line";
      } else if (puzzleState[startX][startY - 1] == "line" && type == "plus2") {
        type = "2line";
      } else {
        type = "none";
        console.log(puzzleState[startX][startY + 1])
      }
    }
    if (type == "line" && puzzleState[startX][startY + 1] == "2line") {
      type = "none";
    }
    if (puzzleState[startX][y + 1] != type) {
      for (i = startY + 1; i < destinationY; i += 2) {
        if (type != "none") {
          puzzleState[startX][i] = type;
        }
      }
    }
  }
  // console.log(puzzleState);
  return puzzleState;
}
function puzzleObject(puzzString) {
  this.puzzleString = puzzString;
  splitPuzz = puzzString.split(":", 2);
  puzzData = splitPuzz[1];
  wxh = splitPuzz[0].split("x");
  this.width = wxh[0];
  this.height = wxh[1];
  this.puzzleState = new Array((this.height * 2) + 1);
  for (var i = 0; i <= (this.height * 2); i++) {
    this.puzzleState[i] = new Array((this.width * 2) + 1);
  }
  formattedPuzzle = this.puzzleString.split(":");
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
  for (x = 0; x <= (this.height * 2); x++) {
    for (y = 0; y <= (this.width * 2); y++) {
      if ((y % 2 != 0) && (x % 2 != 0)) {
        if (puzzData2[z] == "-") {
          this.puzzleState[x][y] = "nonumber";
        } else {
          this.puzzleState[x][y] = puzzData2[z];
        }
        z++;
      } else if (y % 2 != 0 && x % 2 == 0) {
        if (x == 0 || x == (this.height * 2)) {
          // this.puzzleState[x][y] = "xline";
          this.puzzleState[x][y] = "noline";
        } else {
          this.puzzleState[x][y] = "noline";
        }
      } else if (x % 2 != 0 && y % 2 == 0) {
        if (y == 0 || y == (this.width * 2)) {
          // this.puzzleState[x][y] = "xline";
          this.puzzleState[x][y] = "noline";
        } else {
          this.puzzleState[x][y] = "noline";
        }
      } else {
        this.puzzleState[x][y] = "dot";
      }
    }
  }
  puzzleObject.prototype.getHeight = function() { return this.height; };
  puzzleObject.prototype.getWidth = function() { return this.width; };
  puzzleObject.prototype.getPuzzleState =
      function() { return this.puzzleState; };
}
function shuffle(array) {
  for (var i = array.length - 1; i > -1; i--) {
    var index = (Math.random() * i) | 0;
    var temp = array[i];
    array[i] = array[index];
    array[index] = temp;
  }
  return array;
}
