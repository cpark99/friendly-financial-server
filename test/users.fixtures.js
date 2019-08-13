function makeUsersArray() {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test@tester.com',
      password: 'password',
      date_modified: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test2@tester.com',
      password: 'password',
      date_modified: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test3@tester.com',
      password: 'password',
      date_modified: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test4@tester.com',
      password: 'password',
      date_modified: '2029-01-22T16:28:32.615Z'
    },
  ];
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 911,
    date_created: new Date().toISOString(),
    email: 'Naughty naughty very naughty <script>alert("xss");</script>',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedUser = {
    ...maliciousUser,
    email: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousUser,
    expectedUser,
  }
}

module.exports = {
  makeUsersArray,
  makeMaliciousUser,
}