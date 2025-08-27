var margin = [20, 200, 20, 140],
  width = 2000 - margin[1] - margin[3],
  height = 1600 - margin[0] - margin[2],
  i = 0,
  duration = 1250,
  root,
  spacingFactor = 500; // horizontal spacing

var tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal().projection(function (d) {
  return [d.y, d.x];
});

var vis = d3
  .select("body")
  .append("svg:svg")
  .attr("width", width + margin[1] + margin[3])
  .attr("height", height + margin[0] + margin[2])
  .append("svg:g")
  .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

// load the external data
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

  // Initialize tree
  root.children.forEach(toggleAll);
  update(root);

  // === Add Fixed Column Headers (Goals, Objectives, PMs) ===
  var headers = [
    { text: "Goals", col: 1 },
    { text: "Objectives", col: 2 },
    { text: "PMs", col: 3 },
  ];

  vis
    .selectAll("text.header")
    .data(headers)
    .enter()
    .append("text")
    .attr("class", "header")
    .attr("x", function (d) {
      return d.col * spacingFactor;
    })
    .attr("y", -30) // position above nodes
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "darkblue")
    .text(function (d) {
      return d.text;
    });
});

function update(source) {
  var nodes = tree.nodes(root).reverse();

  nodes.forEach(function (d) {
    d.y = d.depth * spacingFactor;
  });

  var node = vis.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });

  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function (d) {
      toggle(d);
      update(d);
    });

  // === Append text first with styles so bbox is correct ===
  nodeEnter
    .append("text")
    .style("font-size", "12px") // ✅ Bigger font
    .style("font-weight", "bold") // ✅ Bold
    .style("fill", "black")
    .attr("dy", ".35em") // vertical centering
    .attr("text-anchor", "start") // left aligned
    .text(function (d) {
      return d.name;
    });

  // === Measure text AFTER styles are applied ===
  nodeEnter.each(function (d) {
    var bbox = this.querySelector("text").getBBox();
    d.textWidth = bbox.width + 20; // horizontal padding
    d.textHeight = bbox.height + 20; // vertical padding
  });

  // === Insert rectangle behind text ===
  nodeEnter
    .insert("rect", "text")
    .attr("x", function (d) {
      return -d.textWidth / 2;
    })
    .attr("y", function (d) {
      return -d.textHeight / 2;
    })
    .attr("width", function (d) {
      return d.textWidth;
    })
    .attr("height", function (d) {
      return d.textHeight;
    })
    .style("fill", "#fdfeffff")
    .style("stroke", "black")
    .style("stroke-width", "1.5px");

  // === Reposition text inside rect (left aligned with padding) ===
  nodeEnter.select("text").attr("x", function (d) {
    return -d.textWidth / 2 + 10;
  });

  // === Handle node updates ===
  var nodeUpdate = node
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function (d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("rect").style("fill-opacity", 1e-6);
  nodeExit.select("text").style("fill-opacity", 1e-6);

  // === Links between nodes ===
  var link = vis.selectAll("path.link").data(tree.links(nodes), function (d) {
    return d.target.id;
  });

  link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", function (d) {
      var o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    })
    .transition()
    .duration(duration)
    .attr("d", diagonal);

  link.transition().duration(duration).attr("d", diagonal);

  link
    .exit()
    .transition()
    .duration(duration)
    .attr("d", function (d) {
      var o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    })
    .remove();

  // Stash positions
  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}

function goDark() {
  var element = document.body;
  element.classList.toggle("dark-Mode");
}
