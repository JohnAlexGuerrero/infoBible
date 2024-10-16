
// Dimensiones del gráfico
const width = 500;
const radius = width / 2;

// Seleccionar el SVG y establecer sus dimensiones
const svg = d3.select("svg")
  .attr("viewBox", `0 0 ${width} ${width}`)
  .append("g")
  .attr("transform", `translate(${width / 2},${width / 2})`);

// Crear la estructura jerárquica del Sunburst
const root = d3.partition()
  .size([2 * Math.PI, radius])
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value));

// Crear una escala de colores para las diferentes secciones
const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

// Generar los arcos para cada segmento del Sunburst
const arc = d3.arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => d.y0)
  .outerRadius(d => d.y1);

// Dibujar las secciones del Sunburst
svg.append("g")
  .selectAll("path")
  .data(root.descendants())
  .join("path")
  .attr("display", d => d.depth ? null : "none") // Ocultar el círculo central
  .attr("d", arc)
  .style("fill", d => color((d.children ? d : d.parent).data.name))
  .style("stroke", "#fff")
  .append("title")
  .text(d => `${d.data.name}: ${d.value}`);

// Añadir interactividad (hover) opcional
svg.selectAll("path")
  .on("mouseover", function(event, d) {
    d3.select(this).style("fill", "orange");
  })
  .on("mouseout", function(event, d) {
    d3.select(this).style("fill", d => color((d.children ? d : d.parent).data.name));
  });

  //Añadir etiquetas a los arcos
  svg.append("g")
  .selectAll("text")
  .data(root.descendants())
  .join("text")
  .attr("transform", function(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI; // Calcular el ángulo medio
    const y = (d.y0 + d.y1) / 2; // Posicionar el texto en el radio medio
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  })
  .attr("dy", "0.35em") // Ajustar la alineación vertical
  .attr("text-anchor", d => (d.x0 + d.x1) / 2 < Math.PI ? "start" : "end") // Ajustar la posición del texto según el ángulo
  .text(d => d.data.name)
  .style("font-size", "10px")
  .style("fill", "#000");
