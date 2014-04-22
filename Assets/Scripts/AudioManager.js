#pragma strict

var audioRotate:AudioClip;
var audioCleanRow:AudioClip;
var audioBackground:AudioClip;
var audioMove:AudioClip;

var volumeRotate:float = 2.0;
var volumeCleanRow:float = 2.0;
var volumeBackground:float = 2.0;
var volumeMove:float = 2.0;

function playSoundOfRotate(){
	if(audioRotate == null) {
		return;
	}
	
	if(audio.isPlaying) {
		audio.Stop();
	}
	
	audio.clip = audioRotate;
	audio.volume = volumeRotate;
	audio.Play();
}

function playSoundOfCleanRow(){
	if(audioCleanRow == null) {
		return;
	}
	
	if(audio.isPlaying) {
		audio.Stop();
	}
	
	audio.clip = audioCleanRow;
	audio.volume = volumeCleanRow;
	audio.Play();
}

function playSoundOfMove(){
	if(audioMove == null) {
		return;
	}
	
	if(audio.isPlaying) {
		audio.Stop();
	}
	
	audio.clip = audioMove;
	audio.volume = volumeMove;
	audio.Play();
}

function resetGame() {
	if( audio.isPlaying){
		audio.Stop();
	}
}

@script RequireComponent(AudioSource)