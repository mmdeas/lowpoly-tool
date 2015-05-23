var lowpoly = lowpoly || {};
lowpoly.anchorFor = {};

lowpoly.init = function()
{
	var width = window.innerWidth * 0.9;
	var height = window.innerHeight * 0.9;

	lowpoly.stage = new Konva.Stage({
		container: 'container',
		width: width,
		height: height
	});

	var layer = new Konva.Layer();
	layer.name = "main"

	lowpoly.stage.add(layer);

	lowpoly.stage.on('contentClick', lowpoly.stageClick);
}

lowpoly.stageClick = function(event)
{
	var anchor = new Konva.Circle({
		radius: 5,
		x: event.evt.x,
		y: event.evt.y,
		fill: 'white',
		stroke: 'black'
	});

	var layer = lowpoly.stage.find("Layer")[0];
	layer.add(anchor);
	lowpoly.stage.add(layer);
}
