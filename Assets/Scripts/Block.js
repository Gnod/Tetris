#pragma strict

var col : int;
var count : int;
var pos : Vector3;
var shapes : boolean[];
var blockObjs : GameObject[];
var cube : GameObject;
var color : Color;

function initShape() {
	
	color = Color(Random.Range(0, 1.0), 
							Random.Range(0, 1.0), 
							Random.Range(0, 1.0), 
							1.0f);
	initShapeWithColor(color);
}

function initShapeWithColor(color : Color) {
	blockObjs = new GameObject[count];
	var index : int = 0;
	for ( var i = 0; i < col; i ++ ) {
		for ( var j = 0; j < col; j ++) {
			if ( shapes[i*col + j]) {
				blockObjs[index] = Instantiate(cube) as GameObject;
				blockObjs[index].transform.position = new Vector3(pos.x + j, pos.y - i, pos.z);
				blockObjs[index].GetComponent(MeshRenderer).material.SetColor("_Color", color);	
				index ++;		
			}
		}
	}
}

function updateShape() {
	
	for ( var i = 0; i < count; i ++ ) {
		
		var position : Vector3 = blockObjs[i].transform.position;
		var yPos = position.y - 1;
		blockObjs[i].transform.position = new Vector3(position.x, yPos, position.z);
	}
	pos = new Vector3(pos.x, pos.y - 1, 0);
}

function Rotate() {
	var newShapes : boolean[] = new boolean[col*col];
	
	var index : int = 0;
	for ( var i = 0; i < col; i ++ ) {
		for ( var j = 0; j < col; j ++ ) {
			newShapes[i*col + j] = shapes[ (col - 1 -j)*col + i];
			if(newShapes[i*col + j]) {
				blockObjs[index].transform.position = new Vector3(pos.x + j, pos.y - i, 0);
				index ++;
			}
		}
	}
	shapes = newShapes;
}	

//function MoveLeft(blocks) {
//	var move : boolean = true;
//	
//	for ( var i = 0; i < row; i ++ ) {
//		var p : Vector3 = blockObjs[i].transform.position;
//		if ( p.x <= 0 || blocks[p.x - 1, p.y] == true) {
//			move = false;
//			break;
//		}
//	}
//	
//	if( move ) {
//		for ( var j = 0; j < row; j ++ ) {
//			var position : Vector3 = blockObjs[j].transform.position;
//			blockObjs[j].transform.position = new Vector3(position.x - 1, position.y, position.z);
//		}
//		pos = new Vector3(pos.x - 1, pos.y, pos.z);
//	}
//	
//	return move;
//}
//
//function MoveRight(blocks) {
//	return MoveHorizontal(1, blocks);
//}

