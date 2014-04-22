#pragma strict

var manager : Manager;
var textColor : Color = Color.yellow;

private var textMesh : TextMesh;

function Start () {

	textMesh = GetComponent("TextMesh") as TextMesh;
	textMesh.renderer.material.color = textColor;
}


function Update () {
	
	if(!manager.gameOver) {
		textMesh.text = "Score:\n  " + manager.scores;
	} else {
		textMesh.text = "";
	}
}