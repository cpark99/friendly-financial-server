function makeProfilesArray() {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester',
      email: 'test@tester.com',
      phone: '(888)888-8888',
      life_insurance_goal: '',
      get_email: true,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 2,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester2',
      email: 'test2@tester.com',
      phone: '(888)888-8889',
      life_insurance_goal: '',
      get_email: true,
      get_call: true,
      get_newsletter: false
    },
    {
      id: 3,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester3',
      email: 'test3@tester.com',
      phone: '(888)888-8887',
      life_insurance_goal: '',
      get_email: false,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 4,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester4',
      email: 'test4@tester.com',
      phone: '(888)888-8886',
      life_insurance_goal: '',
      get_email: true,
      get_call: false,
      get_newsletter: true
    },
  ];
}

function makeMaliciousProfile() {
  const maliciousProfile = {
    id: 911,
    date_created: new Date().toISOString(),
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    email: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    phone: 'phone',
    life_insurance_goal: '',
    get_email: true,
    get_call: true,
    get_newsletter: true
  }
  const expectedProfile = {
    ...maliciousProfile,
    name: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    email: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    phone: 'phone'
  }
  return {
    maliciousProfile,
    expectedProfile,
  }
}

module.exports = {
  makeProfilesArray,
  makeMaliciousProfile,
}