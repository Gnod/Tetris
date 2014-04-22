#pragma strict

function Start () {
	var color:Color = new Color();
	color.a = 0.5f;
	color.r = 0.1f;
	color.g = 0.1f;
	color.b = 0.1f;
	gameObject.renderer.material.color = color;
}

function Update () {

}