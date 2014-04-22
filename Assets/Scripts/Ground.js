#pragma strict

function Start () {
	var col : Color = Color.gray;
	GetComponent(MeshRenderer).material.SetColor("_Color", col);
}

function Update () {
	
}