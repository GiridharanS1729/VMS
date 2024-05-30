app.get('/view', async (req, res) => {
    try {
        const perPage = 3;
        const page = parseInt(req.query.page) || 1;
        const startLetters = req.query.start || '';

        const searchQuery = startLetters
            ? { username: { $regex: `^${startLetters}`, $options: 'i' } }
            : {};

        const totalRecords = await Home.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalRecords / perPage);

        const events = await Home.find(searchQuery)
            .skip((page - 1) * perPage)
            .limit(perPage);

        // Function to format date in the format "date [time]"
        const formatDate = (dateString) => {
            const dateObject = new Date(dateString);
            const formattedDate = dateObject.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            });
            const formattedTime = dateObject.toLocaleTimeString('en-US', {
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
            });
            return `${formattedDate} [${formattedTime}]`;
        };

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Events Table</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                p {
                    font-size: 24px;
                    margin: 0;
                    padding: 20px;
                    background-color: #343a40;
                    color: white;
                    text-align: center;
                }
                .search-container {
                    text-align: right;
                    margin: 20px 10%;
                }
                .search-container input[type="text"] {
                    padding: 10px;
                    font-size: 17px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                table {
                    margin: 20px auto;
                    width: 90%;
                    border-collapse: collapse;
                    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
                    background-color: white;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background-color: #6c757d;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:hover {
                    background-color: #ddd;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    margin: 20px 0;
                }
                .pagination a {
                    color: #343a40;
                    padding: 8px 16px;
                    text-decoration: none;
                    border: 1px solid #ddd;
                    margin: 0 2px;
                }
                .pagination a.active {
                    background-color: #343a40;
                    color: white;
                    border: 1px solid #343a40;
                }
                .pagination a:hover:not(.active) {
                    background-color: #ddd;
                }
                </style>
            </head>
            <body>
                <p>All Visitors:</p>
                <div class="search-container">
                    <input type="text" id="searchInput" name="search" placeholder="Search by Name" value="${startLetters}">
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Room Number</th>
                            <th>User Name</th>
                            <th>Contact Number</th>
                            <th>Aadhar Number</th>
                            <th>In-Time</th>
                            <th>Out-Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => `
                            <tr>
                                <td>${event._id}</td>
                                <td>${event.username}</td>
                                <td>${event.phone}</td>
                                <td>${event.aadhar}</td>
                                <td>${formatDate(event.intime)}</td>
                                <td>${formatDate(event.outtime)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="pagination">
                    ${Array.from({ length: totalPages }, (_, i) => `
                        <a href="/view?page=${i + 1}&start=${startLetters}" class="${page === i + 1 ? 'active' : ''}">${i + 1}</a>
                    `).join('')}
                </div>
                <script>
                    const searchInput = document.getElementById('searchInput');
                    let timer;
                    searchInput.addEventListener('input', function() {
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            const startLetters = searchInput.value.trim();
                            const url = '/view?start=' + startLetters;
                            window.location.href = url;
                        }, 500);
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error: ${error}`);
    }
});
