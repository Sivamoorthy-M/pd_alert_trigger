const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.get("/trigger/:tokenId", async (req, res) => {
    const tokenId = req.params.tokenId;
    try {
        // Get incidents
        const response = await axios.get(
            "https://api.pagerduty.com/incidents?statuses[]=triggered&team_ids[]=PKKCHBQ",
            {
                headers: {
                    Authorization: `Token token=${tokenId}`,
                    Accept: "application/vnd.pagerduty+json;version=2"
                }
            }
        );

        const incidents = response.data.incidents;

        // Update all incidents
        const results = await Promise.all(
            incidents.map(async (incident) => {
                try {
                    const updateResponse = await axios.put(
                        `https://api.pagerduty.com/incidents/${incident.id}`,
                        {
                            incident: {
                                type: "incident_reference",
                                status: "acknowledged"
                            }
                        },
                        {
                            headers: {
                                Authorization: `Token token=${tokenId}`,
                                Accept: "application/vnd.pagerduty+json;version=2",
                                "Content-Type": "application/json",
                                From: "smoorthy@wsgc.com"
                            }
                        }
                    );

                    return {
                        id: incident.id,
                        status: "success"
                    };
                } catch (err) {
                    return {
                        id: incident.id,
                        status: "failed",
                        error: err.response?.data || err.message
                    };
                }
            })
        );

        res.json({
            status: "ok",
            incidentsFound: incidents.length,
            results
        });

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({
            error: "failed",
            details: err.response?.data || err.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Listening on port ${PORT}`);
// });