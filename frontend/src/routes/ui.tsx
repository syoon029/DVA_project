import * as d3 from "d3";

import { Box, Flex } from "@chakra-ui/react";
import { Feature, Geometry } from "geojson";
import { useEffect, useRef } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { feature } from "topojson-client";

interface StateData {
	[key: string]: number;
}

export const Route = createFileRoute("/ui")({
	component: UI,
});

function UI() {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const width = 960;
	const height = 600;
	// Sample data for states
	const mockData: StateData = {
		AL: 4.5,
		AK: 2.8,
		AZ: 3.9,
		// Add data for all states
	};

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);

		// Clear previous content
		svg.selectAll("*").remove();

		// Create projection
		const projection = d3
			.geoAlbersUsa()
			.scale(1300)
			.translate([width / 2, height / 2]);

		const path = d3.geoPath().projection(projection);

		// Color scale
		const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 10]); // Adjust domain based on your data

		// Load US map data
		d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then((us: any) => {
			const states = feature(us, us.objects.states);

			// Draw states
			svg
				.selectAll("path")
				.data((states as any).features)
				.enter()
				.append("path")
				.attr("d", path as any)
				.attr("class", "state")
				.style("fill", function (d) {
					const feature = d as unknown as Feature<Geometry>;
					const stateId = (feature.properties as any).name;
					return colorScale(mockData[stateId] || 0);
				})
				.style("stroke", "#000")
				.style("stroke-width", "1")
				.on("mouseover", function (event, d) {
					d3.select(this).style("fill", "yellow");
				})
				.on("mouseout", function (event, d) {
					const feature = d as unknown as Feature<Geometry>;
					const stateId = (feature.properties as any).name;
					d3.select(this).style("fill", colorScale(mockData[stateId] || 0));
				});
		});
	}, []);

	return (
		<Flex align="center" justify="center" w="100vw" h="100vh">
			<Box position="relative" width={width} height={height}>
				<svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
			</Box>
		</Flex>
	);
}
