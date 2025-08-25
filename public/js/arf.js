var margin = [20, 200, 20, 140],
  width = 1400 - margin[1] - margin[3],
  height = 1200 - margin[0] - margin[2],
  i = 0,
  duration = 1250,
  root,
  spacingFactor = 300; // horizontal spacing

var tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal().projection(function (d) {
  return [d.y, d.x];
});

var vis = d3.select("body").append("svg:svg")
  .attr("width", width + margin[1] + margin[3])
  .attr("height", height + margin[0] + margin[2])
  .append("svg:g")
  .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

// Load data
d3.json("arf.json", function (json) {
  root = json;
  root.x0 = height / 2;
  root.y0 = 0;

  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  root.children.forEach(toggleAll);
  update(root);
});

function update(source) {
  var nodes = tree.nodes(root).reverse();
  nodes.forEach(function (d) {
    d.y = d.depth * spacingFactor;
  });

  var node = vis.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });

  // Enter nodes
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function (d) {
      toggle(d);
      update(d);
    });

  // Box
  nodeEnter.append("rect")
    .attr("rx", 6).attr("ry", 6)
    .style("fill", "#f9f9f9")
    .style("stroke", "#ccc")
    .style("stroke-width", 1);

  // Text
  var text = nodeEnter.append("a")
    .attr("target", "_blank")
    .attr("xlink:href", function (d) { return d.url; })
    .append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("fill", function (d) { return d.free ? 'black' : '#999'; })
    .style("font-size", "12px")
    .style("fill-opacity", 1e-6);

  text.each(function (d) {
    var arr = wrapText(d.name, 25);
    for (var i = 0; i < arr.length; i++) {
      d3.select(this).append("tspan")
        .attr("x", 0)
        .attr("dy", i === 0 ? ".35em" : "1.2em")
        .text(arr[i]);
    }
  });

  // Adjust rect size to text
  nodeEnter.each(function () {
    var g = d3.select(this);
    var textEl = g.select("text").node();
    if (textEl) {
      var bbox = textEl.getBBox();
      g.select("rect")
        .attr("x", bbox.x - 8)
        .attr("y", bbox.y - 6)
        .attr("width", bbox.width + 20)
        .attr("height", bbox.height + 12);

      // Radio button (circle) on right side of box
      g.append("circle")
        .attr("class", "radio-btn")
        .attr("cx", bbox.x + bbox.width + 20) // right side + margin
        .attr("cy", bbox.y + bbox.height / 2)
        .attr("r", 6)
        .style("fill", "#fff")
        .style("stroke", "#666")
        .style("stroke-width", 1.5);
    }
  });

  // Transition nodes
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("text").style("fill-opacity", 1);

  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("rect").style("fill-opacity", 1e-6);
  nodeExit.select("text").style("fill-opacity", 1e-6);
  nodeExit.select("circle.radio-btn").style("fill-opacity", 1e-6);

  // Update links
  var link = vis.selectAll("path.link")
    .data(tree.links(nodes), function (d) { return d.target.id; });

  link.enter().insert("svg:path", "g")
    .attr("class", "link")
    .attr("d", function (d) {
      var o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    })
    .transition().duration(duration)
    .attr("d", diagonal);

  link.transition().duration(duration).attr("d", diagonal);

  link.exit().transition().duration(duration)
    .attr("d", function (d) {
      var o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    })
    .remove();

  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}

// Wrap text helper
function wrapText(text, maxChars) {
  var words = text.split(/\s+/), lines = [], line = [];
  words.forEach(function (word) {
    if ((line.join(" ") + " " + word).trim().length > maxChars) {
      lines.push(line.join(" "));
      line = [word];
    } else {
      line.push(word);
    }
  });
  if (line.length) lines.push(line.join(" "));
  return lines;
}


// Toggle Dark Mode
function goDark() {
  var element = document.body;
  element.classList.toggle("dark-Mode");
}