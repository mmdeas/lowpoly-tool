var lowpoly = lowpoly || {};
lowpoly.anchorFor = {};
lowpoly.currentLayer;
lowpoly.layers = {};

lowpoly.init = function()
{
	var width = window.innerWidth * 0.9;
	var height = window.innerHeight * 0.9;

	lowpoly.stage = new Konva.Stage({
		container: 'container',
		width: width,
		height: height
	});

	var bg_image_obj = new Image();
	bg_image_obj.src = 'test.jpg';
	bg_image_obj.onload = function()
	{
		var image_layer = new Konva.Layer();
		var image = new Konva.Image({
			image: bg_image_obj,
			x: 0,
			y: 0
		});
		image_layer.add(image);
		lowpoly.stage.add(image_layer);
		image_layer.moveToBottom();
		image.on('click', lowpoly.stageClick);
	}

	var anchor_layer = new Konva.Layer();
	var line_layer = new Konva.Layer();
	var poly_layer = new Konva.Layer();
	lowpoly.layers["main"] = {
		anchors: anchor_layer,
		lines: line_layer,
		polys: poly_layer
	}
	lowpoly.currentLayer = "main";
	

	lowpoly.stage.add(anchor_layer);
	lowpoly.stage.add(line_layer);
	lowpoly.stage.add(poly_layer);
}

lowpoly.stageClick = function(event)
{
	lowpoly.lastAnchors = lowpoly.lastAnchors || [];
	if (!event.evt.shiftKey && !event.evt.altKey)
		lowpoly.lastAnchors = [];
	if (event.evt.shiftKey && lowpoly.lastAnchors.length == 2)
		lowpoly.lastAnchors.shift();
	var x = event.evt.x;
	var y = event.evt.y;
	// draw new anchor
	var anchor = new Konva.Circle({
		radius: 5,
		x: x,
		y: y,
		fill: 'white',
		stroke: 'black'
	});
	anchor.on("click", lowpoly.anchorClick);
	var layer = lowpoly.layers[lowpoly.currentLayer];
	layer.anchors.add(anchor);
	lowpoly.stage.add(layer.anchors);

	lowpoly.anchorFor[anchor] = [];

	// draw lines
	if (lowpoly.lastAnchors.length > 0)
	{
		var prev = lowpoly.lastAnchors[0];
		var line = new Konva.Line({
			points: [anchor.x(), anchor.y(), prev.x(), prev.y()],
			stroke: 'black'
		});
		layer.lines.add(line);
		lowpoly.anchorFor[anchor].push(line);
		lowpoly.anchorFor[prev].push(line);
	}
	if (lowpoly.lastAnchors.length == 2)
	{
		var prev = lowpoly.lastAnchors[1];
		var line = new Konva.Line({
			points: [anchor.x(), anchor.y(), prev.x(), prev.y()],
			stroke: 'black'
		});
		layer.lines.add(line);
		lowpoly.lastAnchors.shift();
		lowpoly.anchorFor[anchor].push(line);
		lowpoly.anchorFor[prev].push(line);
	}
	lowpoly.lastAnchors.push(anchor);
	lowpoly.stage.add(layer.lines);
}

lowpoly.anchorClick = function(event)
{
	console.log("anchorClick");
	console.log(event);
}
