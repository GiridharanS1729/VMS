const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

const homePath = path.join(__dirname, 'home.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file from disk: ${err}`);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing file to disk: ${err}`);
  }
};

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const users = readJsonFile(homePath);

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Username already exists.' });
  }

  const newUser = { _id: users.length + 1, username, password };
  users.push(newUser);
  writeJsonFile(homePath, users);

  console.log('User created:', newUser);
  res.send("Account has been made!");
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJsonFile(homePath);

  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    console.log('Login successful:', user);
    return res.status(200).json({ message: 'Login successful' });
  } else {
    console.log('Login failed: User not found');
    res.status(400).json({ message: 'Login failed: User not found' });
  }
});

app.post('/add', (req, res) => {
  const { idc, username, phone, aadhar, intime, outtime, password } = req.body;
  const users = readJsonFile(homePath);

  const newUser = { _id: idc, username, phone, aadhar, intime, outtime, password };
  users.push(newUser);
  writeJsonFile(homePath, users);

  console.log('User created:', newUser);
  res.send("Account has been made!");
});

app.get('/view', (req, res) => {
  const perPage = 8;
  const page = parseInt(req.query.page) || 1;
  const startLetters = req.query.start || '';
  const users = readJsonFile(homePath);

  const searchQuery = startLetters
    ? users.filter(user => user.username.toLowerCase().startsWith(startLetters.toLowerCase()))
    : users;

  const totalRecords = searchQuery.length;
  const totalPages = Math.ceil(totalRecords / perPage);
  const events = searchQuery.slice((page - 1) * perPage, page * perPage);

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
          .tot{
            font-size: 24px;
            text-align: left;
            margin-top: 50px;
            margin-left: 100px;
            font-weight:800;
            color:#a00;
          }
          .search-container {
              text-align: right;
              margin: 10px 10%;
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
      <div class="tot">
      Total Visitors : ${totalRecords}
      </div>
      <div class="search-container">
          <input type="text" id="searchInput" name="search" placeholder="Search by Name" value="${startLetters}">
      </div>
          <table>
              <thead>
                  <tr>
                      <th>Room Number</th>
                      <th>Name</th>
                      <th>Contact Number</th>
                      <th>Aadhar Number</th>
                      <th>In Time</th>
                      <th>Out Time</th>
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
});

app.post('/update', (req, res) => {
  const { idc, username, phone, aadhar, intime, outtime, password } = req.body;
  const users = readJsonFile(homePath);

  const userIndex = users.findIndex(user => user._id === idc);
  if (userIndex !== -1) {
    const user = users[userIndex];
    users[userIndex] = {
      ...user,
      username: username || user.username,
      phone: phone || user.phone,
      aadhar: aadhar || user.aadhar,
      intime: intime || user.intime,
      outtime: outtime || user.outtime,
      password: password || user.password
    };
    writeJsonFile(homePath, users);
    console.log("User updated successfully");
    return res.status(200).json({ message: 'User updated successfully' });
  } else {
    console.log("User not found");
    return res.status(404).json({ message: 'User not found' });
  }
});

app.post('/delete', (req, res) => {
  const { idc } = req.body;
  const users = readJsonFile(homePath);

  const newUsers = users.filter(user => user._id !== idc);
  if (users.length !== newUsers.length) {
    writeJsonFile(homePath, newUsers);
    console.log("User deleted successfully");
    return res.status(200).json({ message: 'User deleted successfully' });
  } else {
    console.log("User not found");
    return res.status(404).json({ message: 'User not found' });
  }
});

const PORT = process.env.PORT || 4201;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
