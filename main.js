if (typeof(lowpoly) === 'undefined')
{
	var lowpoly = {
	anchorFor: {},
	fromAnchors: {},
	currentLayer: undefined,
	layers: {},
	lastAnchors: []
	}
}

lowpoly.init = function()
{
	var width = window.innerWidth;
	var height = window.innerHeight;

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
		lowpoly.connectAnchors(prev, anchor);
	}
	if (lowpoly.lastAnchors.length == 2)
	{
		var prev = lowpoly.lastAnchors[1];
		lowpoly.connectAnchors(prev, anchor);
		lowpoly.lastAnchors.shift();
	}
	lowpoly.lastAnchors.push(anchor);
	lowpoly.stage.add(layer.lines);
}

lowpoly.connectAnchors = function(a1, a2)
{
	var line = new Konva.Line({
		points: [a1.x(), a1.y(), a2.x(), a2.y()],
		stroke: 'black'
	});
	var layer = lowpoly.layers[lowpoly.currentLayer];
	layer.lines.add(line);
	lowpoly.anchorFor[a1].push(line);
	lowpoly.anchorFor[a2].push(line);
	lowpoly.fromAnchors[line] = [a1, a2];
}

lowpoly.anchorClick = function(event)
{
	if (lowpoly.lastAnchors.length == 0)
	{
		lowpoly.lastAnchors.push(event.target);
		return;
	}
	if (lowpoly.lastAnchors.length == 2)
		lowpoly.lastAnchors.shift();
	if (event.evt.shiftKey)
	{
		lowpoly.connectAnchors(lowpoly.lastAnchors[0], event.target);
	}
	lowpoly.lastAnchors.push(event.target);
	lowpoly.stage.add(lowpoly.layers[lowpoly.currentLayer].lines);
}
