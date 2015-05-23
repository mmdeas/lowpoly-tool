var stage;

function init()
{
	var width = window.innerWidth * 0.9;
	var height = window.innerHeight * 0.9;

	stage = new Konva.Stage({
		container: 'container',
		width: width,
		height: height
	});

	var layer = new Konva.Layer();
	layer.name = "main"

	stage.add(layer);
}
