FlatGraph = function(graph, options) {
    var width = options.width || 700,
        height = options.height || 350,
        graphSelector = options.graphSelector || '#context',
        showParseErr = options.catchParseErr || false,
        makeEdgeBetween,
        margin = 10;

    var d3cola = cola.d3adaptor()
        .linkDistance(120)
        .avoidOverlaps(true)
        .size([width, height]);

    var svg = makeSVG(width, height, graphSelector);

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("class", "node")
        .attr("rx", 4).attr("ry", 4)
        .call(d3cola.drag);
    var label = createLabels(svg, graph, node, d3cola, margin);
    d3cola
        .convergenceThreshold(0.1)
        .nodes(graph.nodes)
        .links(graph.links)
        .start(10, 10, 10);
    d3cola.on("tick", function () {
        node.each(function (d) { return d.innerBounds = d.bounds.inflate(-margin); });
        link.each(function (d) {
            cola.vpsc.makeEdgeBetween(d, d.source.innerBounds, d.target.innerBounds, 5);
            if (isIE())
                this.parentNode.insertBefore(this, this);
        });
        link.attr("x1", function (d) { return d.sourceIntersection.x; })
            .attr("y1", function (d) { return d.sourceIntersection.y; })
            .attr("x2", function (d) { return d.arrowStart.x; })
            .attr("y2", function (d) { return d.arrowStart.y; });
        node.attr("x", function (d) { return d.innerBounds.x; })
            .attr("y", function (d) { return d.innerBounds.y; })
            .attr("width", function (d) { return d.innerBounds.width(); })
            .attr("height", function (d) { return d.innerBounds.height(); });
        var b;
        label.each(function (d) { b = this.getBBox(); })
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y + b.height / 3; });
        //svg.zoomToFit();
    }).on("end", function () {
        svg.zoomToFit();
    });

};

function makeSVG(width, height, graphSelector) {
    var outer = d3.select(graphSelector).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("pointer-events", "all");
    // define arrow markers for graph links
    outer.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5L2,0')
        .attr('stroke-width', '0px')
        .attr('fill', '#555');
    var zoomBox = outer.append('rect')
        .attr('class', 'background')
        .attr('width', "100%")
        .attr('height', "100%");
    var vis = outer.append('g');
    var redraw = function (transition) {
        return (transition ? vis.transition() : vis)
            .attr("transform", "translate(" + zoom.translate() + ") scale(" + zoom.scale() + ")");
    };
    vis.zoomToFit = function () {
        var b = cola.vpsc.Rectangle.empty();
        vis.selectAll("rect").each(function (d) {
            var bb = this.getBBox();
            b = b.union(new cola.vpsc.Rectangle(bb.x, bb.x + bb.width, bb.y, bb.y + bb.height));
        });
        var w = b.width(), h = b.height();
        var cw = Number(outer.attr("width")), ch = Number(outer.attr("height"));
        var s = Math.min(cw / w, ch / h);
        var tx = (-b.x * s + (cw / s - w) * s / 2), ty = (-b.y * s + (ch / s - h) * s / 2);
        zoom.translate([tx, ty]).scale(s);
        redraw(true);
    };
    var zoom = d3.behavior.zoom();
    zoomBox.call(zoom.on("zoom", redraw))
        .on("dblclick.zoom", vis.zoomToFit);
    return vis;
}
function createLabels(svg, graph, node, d3cola, margin) {
    var labelwidth = 0, labelheight = 0;
    var labels = svg.selectAll(".label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.ref; })
        .call(d3cola.drag)
        .each(function (d) {
            var bb = this.getBBox();
            labelwidth = Math.max(labelwidth, bb.width);
            labelheight = Math.max(labelheight, bb.height);
        });
    node.attr("width", labelwidth)
        .each(function (d) {
            d.width = labelwidth + 2 * margin + 10;
            d.height = labelheight + 2 * margin;
        });
    node.append("title")
        .text(function (d) { return d.name; });
    return labels;
}
