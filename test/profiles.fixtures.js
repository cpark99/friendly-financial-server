function makeProfilesArray() {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester',
      email: 'test@tester.com',
      phone: '(888)888-8888',
      life_insurance_goal: '1000000',
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
      life_insurance_goal: '100000',
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
      life_insurance_goal: '500000',
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
      life_insurance_goal: '150000',
      get_email: true,
      get_call: false,
      get_newsletter: true
    },
  ];
}

module.exports = {
  makeProfilesArray,
}