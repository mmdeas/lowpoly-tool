if (typeof(lowpoly) === 'undefined')
{
	var lowpoly = {
	linesWithAnchor: {},
	anchorsForLine: {},
	currentLayer: undefined,
	layers: {},
	lastAnchors: [],
	trianglesForAnchor: []
	};
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
	

	lowpoly.stage.add(line_layer);
	lowpoly.stage.add(poly_layer);
	lowpoly.stage.add(anchor_layer);
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
		stroke: 'black',
		draggable: 'true'
	});
	anchor.on("click", lowpoly.anchorClick);
	anchor.on("dragstart dragmove dragend", lowpoly.anchorDrag);
	var layer = lowpoly.layers[lowpoly.currentLayer];
	layer.anchors.add(anchor);
	lowpoly.stage.add(layer.anchors);

	lowpoly.linesWithAnchor[anchor._id] = [];
	lowpoly.trianglesForAnchor[anchor._id] = [];

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
	lowpoly.stage.add(layer.anchors);
}

lowpoly.connectAnchors = function(a1, a2)
{
	var line = new Konva.Line({
		points: [a1.x(), a1.y(), a2.x(), a2.y()],
		stroke: 'black'
	});
	var layer = lowpoly.layers[lowpoly.currentLayer];
	layer.lines.add(line);
	lowpoly.linesWithAnchor[a1._id].push(line);
	lowpoly.linesWithAnchor[a2._id].push(line);
	lowpoly.anchorsForLine[line._id] = [a1, a2];
	// detect new triangles
	a1neighbours = {};
	lines = lowpoly.linesWithAnchor[a1._id];
	for (line in lines)
	{
		lineId = lines[line]._id;
		lineAnchors = lowpoly.anchorsForLine[lineId];
		if (a1 != lineAnchors[0] && a2 != lineAnchors[0])
			a1neighbours[lineAnchors[0]._id] = lineAnchors[0];
		else if (a1 != lineAnchors[1] && a2 != lineAnchors[1])
			a1neighbours[lineAnchors[1]._id] = lineAnchors[1];
	}
	a2neighbours = {};
	lines = lowpoly.linesWithAnchor[a2._id];
	for (line in lines)
	{
		lineId = lines[line]._id;
		lineAnchors = lowpoly.anchorsForLine[lineId];
		if (a2 != lineAnchors[0] && a1 != lineAnchors[0])
			a2neighbours[lineAnchors[0]._id] = lineAnchors[0];
		else if (a2 != lineAnchors[1] && a1 != lineAnchors[1])
			a2neighbours[lineAnchors[1]._id] = lineAnchors[1];
	}

	if (a1neighbours.size < a2neighbours.size)
	{
		n1 = a1neighbours;
		n2 = a2neighbours;
	}
	else
	{
		n1 = a2neighbours;
		n2 = a1neighbours;
	}

	for (n in n1)
	{
		if (n in n2)
		{
			fill_colour = lowpoly.getColourForTriangle(a1, a2, n1[n]);
			tri = new Konva.Line({
				points: [a1.x(), a1.y(), a2.x(), a2.y(), n1[n].x(), n1[n].y()],
				strokeWidth: 0,
				closed: true,
				fill: fill_colour
			})
			lowpoly.trianglesForAnchor[a1._id].push(tri);
			lowpoly.trianglesForAnchor[a2._id].push(tri);
			lowpoly.trianglesForAnchor[n1[n]._id].push(tri);
			lowpoly.layers[lowpoly.currentLayer].polys.add(tri);
			lowpoly.stage.add(lowpoly.layers[lowpoly.currentLayer].polys);
		}
	}
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
	lowpoly.stage.add(lowpoly.layers[lowpoly.currentLayer].anchors);
}

lowpoly.redrawLine = function(line)
{
	a1 = lowpoly.anchorsForLine[line._id][0];
	a2 = lowpoly.anchorsForLine[line._id][1];
	line.setPoints([a1.x(), a1.y(), a2.x(), a2.y()]);
}

lowpoly.anchorDrag = function(event)
{
	anchor = event.target;
	lines = lowpoly.linesWithAnchor[anchor._id];
	for (line in lines)
	{
		lowpoly.redrawLine(lines[line]);
	}
	lowpoly.stage.add(lowpoly.layers[lowpoly.currentLayer].lines);
	lowpoly.stage.add(lowpoly.layers[lowpoly.currentLayer].anchors);
}

lowpoly.getColourForTriangle = function(a1, a2, a3)
{
	var x = (a1.x() + a2.x() + a3.x()) / 3;
	var y = (a1.y() + a2.y() + a3.y()) / 3;
	var colour = lowpoly.stage.children[0].canvas._canvas.getContext('2d').getImageData(x, y, 1, 1).data;
	var ret = 'rgb(' + colour[0] + ', ' + colour[1] + ', ' + colour[2] + ')';
	return ret;
}
