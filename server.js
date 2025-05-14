const http = require("http");
const axios = require("axios");

// Simple MCP server configuration
const PORT = 3000;
const TOOLS = [
    {
        name: "getWebsiteTitle",
        description: "Fetches the title of a webpage from a given URL.",
        parameters: {
            url: {
                type: "string",
                description:
                    "The URL of the webpage (e.g., https://example.com)",
            },
        },
        execute: async ({ url }) => {
            try {
                // Fetch the webpage
                const response = await axios.get(url);
                // Extract the <title> tag using a simple regex
                const titleMatch = response.data.match(
                    /<title>(.*?)<\/title>/i
                );
                const title = titleMatch ? titleMatch[1] : "No title found";
                return { title };
            } catch (error) {
                return { error: `Failed to fetch title: ${error.message}` };
            }
        },
    },
    {
        name: "addTwoNumbers",
        description: "Adds two numbers together.",
        parameters: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
        },
        execute: ({ a, b }) => {
            if (typeof a !== "number" || typeof b !== "number") {
                return { error: "Both parameters must be numbers" };
            }
            return { result: a + b };
        },
    },
];

// Create an HTTP server to handle MCP requests
const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/mcp/capabilities") {
        // Return the list of tools (MCP discovery endpoint)
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
            JSON.stringify({
                tools: TOOLS.map((t) => ({
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters,
                })),
            })
        );
    } else if (req.method === "POST" && req.url === "/mcp/execute") {
        // Handle tool execution
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const { tool, parameters } = JSON.parse(body);
                const selectedTool = TOOLS.find((t) => t.name === tool);
                if (!selectedTool) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: "Tool not found" }));
                    return;
                }
                const result = await selectedTool.execute(parameters);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Execution failed" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`MCP server running at http://localhost:${PORT}`);
});
