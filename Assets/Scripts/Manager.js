#pragma strict

static var TETRIS_TYPE : int = 7;
static var FRAME_WIDTH_COUNT : int = 12;
static var FRAME_HEIGHT_COUNT : int = 24;
static var TYPE_SOUND_STATE:String = "sound";

var speed : float = 3;
var tetrisObjs : Block[];
var startPos : Vector3 = new Vector3(FRAME_WIDTH_COUNT/2 - 2, FRAME_HEIGHT_COUNT - 1, 0);
var nextTetrisPos : Vector3 = new Vector3(FRAME_WIDTH_COUNT + 1, FRAME_HEIGHT_COUNT/2 - 1, -1);
var rewardScores : int[];
var gameOverText : String = "Tetris";
var gameScoreText : String = "Score:";
var playBtnText : String = "Play";
var gamePausing : boolean = false;

var soundMgr:AudioManager;
var gameMessageColor : Color = Color.yellow;
var gameMessageFont : Font;
var gameTitleTextSize:int = 30;
var gameBtnTextSize:int = 20;

var scores : int = 0;
var gameOver : boolean = true;
var soundOn:boolean = true;
var soundBtnText:String = "Sound:";

private var frameStates : boolean[] = new boolean[FRAME_WIDTH_COUNT * FRAME_HEIGHT_COUNT];
private var frameObjs : GameObject[] = new GameObject[FRAME_WIDTH_COUNT * FRAME_HEIGHT_COUNT];

private var nextTetrisIndex : int;
private var tetris : Block;
private var nextTetris : Block;
private var wall : GameObject;
private var wallRes:GameObject;
private var fastDropping : boolean = false;
private var movingLeft : boolean = false;
private var movingRight : boolean = false;
private var touchMoving:boolean = false;
private var touchCount:long = 0;
private var inSettingFlag:boolean = false;

private var width : int = Screen.width;
private var height : int = Screen.height;


function OnGUI() {
	GUI.skin.font = gameMessageFont;
	GUI.color = gameMessageColor;
	GUI.backgroundColor = Color.gray;
	
	var boxStyle:GUIStyle = GUI.skin.GetStyle("Box");
	
	boxStyle.normal.textColor = gameMessageColor;
	boxStyle.font = gameMessageFont;
	boxStyle.fontSize = gameTitleTextSize;
	boxStyle.alignment = TextAnchor.MiddleCenter;
	
	var btnStyle:GUIStyle = GUI.skin.GetStyle("Button");
	btnStyle.normal.textColor = gameMessageColor;
	btnStyle.font = gameMessageFont;
	btnStyle.fontSize = gameBtnTextSize;
	btnStyle.alignment = TextAnchor.MiddleCenter;
	
	if(inSettingFlag) {
		GUILayout.BeginArea(new Rect(width / 2 - 125, height / 2 - 100, 250, 200));
		GUILayout.Box("Setting", boxStyle); 
		
		if(soundOn){
			soundBtnText = "Sound:ON";
		} else {
			soundBtnText = "Sound:OFF";
		}
 		if( GUILayout.Button(soundBtnText, btnStyle)) {
			soundOn = !soundOn;
			if(soundOn) {
				PlayerPrefs.SetInt(TYPE_SOUND_STATE, 1);
			} else {
				PlayerPrefs.SetInt(TYPE_SOUND_STATE, 0);
			}
		}
		if( GUILayout.Button("Back", btnStyle)) {
			inSettingFlag = false;
		}
		GUILayout.EndArea();
		return;
	}
	
	if (gameOver && !inSettingFlag) {
		GUILayout.BeginArea(new Rect(width / 2 - 125, height / 2 - 100, 250, 200));
		GUILayout.Box(gameOverText, boxStyle); 
		
		if( GUILayout.Button(playBtnText, btnStyle)) {
			gameOverText = "Game Over";
			playBtnText = "Play Again";
			gameOver = false;
			scores = 0;
			speed = 3;
			
			initGame();
			createTetris();
		}
		if( GUILayout.Button("Setting", btnStyle)) {
			inSettingFlag = true;
		}
		if( GUILayout.Button("Quit", btnStyle)) {
			Application.Quit();
		}
		GUILayout.EndArea();
		return;
	}
	
	if (gamePausing) {
		GUILayout.BeginArea(new Rect(width / 2 - 125, height / 2 - 100, 250, 200));
		GUILayout.Box("Pausing", boxStyle); 
		
		if( GUILayout.Button("Resume", btnStyle)) {
			gamePausing = false;
		}
		if( GUILayout.Button("Restart", btnStyle)) {
				cleanTetris();
			cleanWall();
			
			gamePausing = false;
			scores = 0;
			speed = 3;
			
			initGame();
			createTetris();
		}
		if( GUILayout.Button("Setting", btnStyle)) {
			inSettingFlag = true;
		}
		if( GUILayout.Button("Back", btnStyle)){
			gameOverText = "Tetris";
			playBtnText = "Play";
			gamePausing = false;
			gameOver = true;
			initGameFrame();
			cleanTetris();
			cleanWall();
		}	
		GUILayout.EndArea();
		return;
	}
	
	GUILayout.BeginArea(new Rect(10, 10, 100, 50));
	if( GUILayout.Button("Pause", btnStyle)){
			gamePausing = true;
	}
	GUILayout.EndArea();
}

function Start () {

	var soundState:int = PlayerPrefs.GetInt(TYPE_SOUND_STATE, 1);
	if( soundState == 1) {
		soundOn = true;
	} else {
		soundOn = false;
	}
	
	wallRes = Resources.Load("Wall") as GameObject;
	var cube : GameObject = Resources.Load("Cube") as GameObject;
	tetrisObjs = new Block[TETRIS_TYPE];
	
	tetrisObjs[0] = createBlock(2, 4, [true, true, 
										true,true], cube);
	tetrisObjs[1] = createBlock(3, 4, [false,true,false,
										true,true,true,
										false,false,false], cube);
	tetrisObjs[2] = createBlock(3, 4, [false,false,false, 
										true,true,false, 
										false,true,true], cube);
	tetrisObjs[3] = createBlock(3, 4, [false,false,false,
										false,true,true,
										true,true,false], cube);
	tetrisObjs[4] = createBlock(3, 4, [false,false,false,
										true,true,true,
										false,false,true], cube);
	tetrisObjs[5] = createBlock(3, 4, [false,false,false,
										true,true,true,
										true,false,false], cube);
	tetrisObjs[6] = createBlock(4, 4, [false,false,false,false,
										false,false,false,false,
										true,true,true,true,
										false,false,false,false], cube);
	
//	initGame();
//	createTetris();
	StartCoroutine(UpdateGame());
	StartCoroutine(detectInput());
	
}

function createBlock( col:int, count:int, shapes:boolean[], cube:GameObject) {
	var block : Block = gameObject.AddComponent(Block);
	block.col = col;
	block.count = count;
	block.shapes = shapes;
	block.cube = cube;
	
	return block;
}

function initGame() {
	nextTetrisIndex = Random.Range(0, TETRIS_TYPE);
	cleanWall();
	wall = Instantiate(wallRes) as GameObject;

	initGameFrame();
}

function initGameFrame() {
	for ( var i = 0; i < FRAME_WIDTH_COUNT; i ++ ) {
		for ( var j = 0; j < FRAME_HEIGHT_COUNT; j ++ ) {
			frameStates[i * FRAME_HEIGHT_COUNT + j] = false;
			if (frameObjs[i * FRAME_HEIGHT_COUNT + j] != null ) {
				Destroy(frameObjs[i * FRAME_HEIGHT_COUNT + j]);
			}
			frameObjs[i * FRAME_HEIGHT_COUNT + j] = null;
		}
	}
}

function createTetris() {
	var index : int = nextTetrisIndex;
	nextTetrisIndex = Random.Range(0, TETRIS_TYPE);

	tetris = gameObject.AddComponent(Block);
	tetris.col = tetrisObjs[index].col;
	tetris.count = tetrisObjs[index].count;
	tetris.shapes = tetrisObjs[index].shapes;
	tetris.cube = tetrisObjs[index].cube;
	tetris.pos = startPos;
	if( nextTetris != null) {
		tetris.initShapeWithColor(nextTetris.color);
	} else {
		tetris.initShape();
	}
	
	createNextTetris();
	
	if( checkCollision() ) {
		gameOver = true;
		
		cleanTetris();
		cleanWall();
	}
}

function cleanTetris() {
	for ( var obj : GameObject in tetris.blockObjs) {
		Destroy(obj);
	}
	
	for ( var o : GameObject in nextTetris.blockObjs) {
		Destroy(o);
	}	
}

function cleanWall() {
	if ( wall != null ) {
		Destroy(wall);
	}
}

function createNextTetris() {
	if (nextTetris != null) {
		for (var obj : GameObject in nextTetris.blockObjs) {
			Destroy(obj);
		}
	} else {
		nextTetris = gameObject.AddComponent(Block);
	}
	nextTetris.col = tetrisObjs[nextTetrisIndex].col;
	nextTetris.count = tetrisObjs[nextTetrisIndex].count;
	nextTetris.shapes = tetrisObjs[nextTetrisIndex].shapes;
	nextTetris.cube = tetrisObjs[nextTetrisIndex].cube;
	nextTetris.pos = nextTetrisPos;
	nextTetris.initShape();
}

function UpdateGame() {
	while (true) {
		if (!gameOver && !gamePausing) {
			var timeDelay : float;
			if (fastDropping) {
				timeDelay = 0.04f;
			} else {
				timeDelay = 1.0f / speed;
			}
			
			if (checkCollision()) {
				updateFrame();
				detectAndCleanRow();
				createTetris();
			} else {
				tetris.updateShape();
			}
			
			yield  WaitForSeconds(timeDelay);
		} else {
			yield WaitForSeconds(0.5f);
		}
	
	}
}

function detectInput() {
	while ( true ) {
		if( !gameOver && !gamePausing) {
			if ( movingLeft || movingRight) {
				yield WaitForSeconds(0.1f);
			} else {
				yield WaitForSeconds(0.5f);
			}
			
			if ( movingLeft ) {
				MoveLeft();
			}
			
			if ( movingRight ) {
				MoveRight();
			}
		} else {
			yield WaitForSeconds(0.5f);
		}
	}
}

function detectAndCleanRow() {
	var cleanedRows : int = 0;
	
	for ( var i = FRAME_HEIGHT_COUNT - 1; i >= 0; i -- ) {
		var needClean : boolean = true;
		for ( var j = 0; j < FRAME_WIDTH_COUNT; j ++ ) {
			if ( frameStates[j * FRAME_HEIGHT_COUNT + i] == false) {
				needClean = false;
			}
		}
		
		if ( needClean ) {
			if(soundOn) {
				soundMgr.playSoundOfCleanRow();
			}
			cleanRow(i);
			cleanedRows ++;
		}
	}
	
	if ( cleanedRows > 0 ) {
		scores += rewardScores[cleanedRows - 1];
	}
	
}

function cleanRow(row : int) {
	for ( var i = 0; i < FRAME_WIDTH_COUNT; i ++ ) {
		Destroy(frameObjs[i * FRAME_HEIGHT_COUNT + row]);
	}
	
	for ( var j = row; j < FRAME_HEIGHT_COUNT - 1; j ++ ) {
		for ( var k = 0; k < FRAME_WIDTH_COUNT; k ++ ) {
			frameStates[k * FRAME_HEIGHT_COUNT + j] = frameStates[k * FRAME_HEIGHT_COUNT + (j + 1)];
			frameObjs[k * FRAME_HEIGHT_COUNT + j] = frameObjs[k * FRAME_HEIGHT_COUNT + j + 1];
			
			if ( frameObjs[k * FRAME_HEIGHT_COUNT + j] != null) {
				var position : Vector3 = frameObjs[k * FRAME_HEIGHT_COUNT + j].transform.position;
				frameObjs[k * FRAME_HEIGHT_COUNT + j].transform.position = new Vector3(position.x, position.y - 1, position.z);
			}
		}	
	}
}

function checkCollision() {
	
	for (var obj : GameObject in tetris.blockObjs) {
		
		var xPos : int = obj.transform.position.x;
		var yPos : int = obj.transform.position.y;
		
		if( yPos == 0 || frameStates[xPos * FRAME_HEIGHT_COUNT + (yPos - 1)]) {
			return true;
		}
	}
	
	return false;
}

function updateFrame() {
	for (var obj : GameObject in tetris.blockObjs) {
		
		var xPos : int = obj.transform.position.x;
		var yPos : int = obj.transform.position.y;
		
		frameStates[xPos * FRAME_HEIGHT_COUNT + yPos] = true;
		frameObjs[xPos * FRAME_HEIGHT_COUNT + yPos] = obj;
	}
}

function Update () {
	if ( gameOver) {
		return;
	}
	
	if(Input.GetKeyDown("space")){
		gamePausing = !gamePausing;
	}
	
	if(gamePausing) {
		return;
	}

	if (Input.GetKeyDown("up")) {
		Rotate();
	}
	
	if( Input.GetKeyDown("left") ) {
		MoveLeft();
	} else {
		if ( Input.GetAxis("Horizontal") == -1) {
			movingLeft = true;
		} else {
			movingLeft = false;
		}
	}
	
	if( Input.GetKeyDown("right") ) {
		MoveRight();
	} else {
		if ( Input.GetAxis("Horizontal") == 1){
			movingRight = true;
		} else {
			movingRight = false;
		}
	}
	
	if ( Input.GetKey(KeyCode.DownArrow)) {
		fastDropping = true;
	} else {
		fastDropping = false;
	}
	
	if( Input.touchCount == 1){
		if ( touchCount < 30) {
			++ touchCount;
		}
		
		if(touchCount > 20) {
			fastDropping = true;
		} else {
			fastDropping = false;
		}
	}
	
	if( Input.touchCount == 1 && Input.GetTouch(0).phase == TouchPhase.Moved) {
		var touchDeltaPosition : Vector2 = Input.GetTouch(0).deltaPosition;
		
		if (touchDeltaPosition.x > 10 && !touchMoving) {
			touchMoving = true;
			MoveRight();
		} else if (touchDeltaPosition.x < -10 && !touchMoving) {
			touchMoving = true;
			MoveLeft();
		}
		return;
	}
	
	if( Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Ended) {
		touchMoving = false;
		fastDropping = false;
		touchCount = 0;
	}
	
	if ( Input.touchCount == 2 && Input.GetTouch(0).phase == TouchPhase.Ended) {
			Rotate();	
	}
	
	if (Input.touchCount == 3 && Input.GetTouch(0).phase == TouchPhase.Moved) {
		var touchDelta : Vector2 = Input.GetTouch(0).deltaPosition;
		Camera.main.transform.Translate((-1) * Vector3(touchDelta.x, 0, 0) * 5 * Time.deltaTime);
	}
	
	// camera zoom, four finger vertical move.
	if (Input.touchCount == 4 && Input.GetTouch(0).phase == TouchPhase.Moved) {
		var zoomDelta : Vector2 = Input.GetTouch(0).deltaPosition;
		Camera.main.transform.Translate(Vector3(0, 0, zoomDelta.y) * 5 * Time.deltaTime);
	}
}

function Rotate() {
	
	var canRotate : boolean = true;
	var leftStep = 0;
	var rightStep = 0;
	
	for ( var i = 0; i < tetris.col; i ++ ) {
		for ( var j = 0; j < tetris.col; j ++ ) {
			while(tetris.pos.x < 0) {
				if( !MoveRight()) {
					canRotate = false;
					break;
				} else {
					rightStep ++;
				}
			}
			
			while(tetris.pos.x + tetris.col > FRAME_WIDTH_COUNT) {
				if( !MoveLeft()) {
					canRotate = false;
					break;
				} else {
					leftStep ++;
				}
			}
			
			if( tetris.pos.y - tetris.col <= 0 || frameStates[(tetris.pos.x + i) * FRAME_HEIGHT_COUNT + tetris.pos.y - j]){
				canRotate = false;
			}
		}
	}
	
	if (canRotate) {
		if(soundOn) {
			soundMgr.playSoundOfRotate();
		}
		tetris.Rotate();
	} else {
		var step = rightStep - leftStep;
		if(step != 0) {
			MoveHorizontal(step);
		}
	}
	
}

function MoveLeft() {
	return MoveHorizontal(-1);
}

function MoveRight() {
	return MoveHorizontal(1);
}

function MoveHorizontal(direct : int) {
	var move : boolean = true;
	
	for ( var i = 0; i < tetris.count; i ++ ) {
		var p : Vector3 = tetris.blockObjs[i].transform.position;
		var isOutOfBounds : boolean = false;
		if( direct < 0) {
			isOutOfBounds = (p.x <= 0);
		} else {
			isOutOfBounds = (p.x >= FRAME_WIDTH_COUNT - 1);
		}
		
		if ( isOutOfBounds || frameStates[(p.x + direct) * FRAME_HEIGHT_COUNT + p.y] == true) {
			move = false;
			break;
		}
	}
	
	if( move ) {
		for ( var j = 0; j < tetris.count; j ++ ) {
			var position : Vector3= tetris.blockObjs[j].transform.position;
			tetris.blockObjs[j].transform.position = new Vector3(position.x + direct, position.y, position.z);
		}
		tetris.pos = new Vector3(tetris.pos.x + direct, tetris.pos.y, tetris.pos.z);
		if(soundOn) {
			soundMgr.playSoundOfMove();
		}
	}
	
	return move;
}