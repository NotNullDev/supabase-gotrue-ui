export type Audit = {
  id: string
  payload: any
  created_at: string
  ip_address: string
}

/*
	{
		"id": "8a764c5d-2e07-44b0-9cc8-05ac4a33f6e7",
		"payload": {
			"action": "login",
			"actor_id": "53b9b058-7273-4163-95a9-8db789ba0f25",
			"actor_username": "admin",
			"actor_via_sso": false,
			"log_type": "account",
			"traits": {
				"provider": "email"
			}
		},
		"created_at": "2023-09-30T19:03:48.197493+02:00",
		"ip_address": ""
	},
*/

export type LoginAudit = {
  id: string
  payload: {
    action: string
    actor_id: string
    actor_username: string
    actor_via_sso: boolean
    log_type: string
    traits: {
      provider: string
    }
    ip_address: string
  }
  created_at: string
}

/*
	{
		"user_id": "53b9b058-7273-4163-95a9-8db789ba0f25",
		"created_at": "2023-09-30T09:34:45.765658+02:00",
		"updated_at": "2023-09-30T09:34:45.765658+02:00",
		"factor_id": null,
		"amr": [
			{
				"id": "133ff0e3-6da2-432d-a4b6-8f3cea05f98e",
				"session_id": "da240037-96fe-491e-8fdc-f68738185234",
				"created_at": "2023-09-30T09:34:45.771262+02:00",
				"updated_at": "2023-09-30T09:34:45.771262+02:00",
				"authentication_method": "password"
			}
		],
		"aal": "aal1"
	},
*/

export type ActiveSession = {
  user_id: string
  created_at: string
  updated_at: string
  factor_id: any
  amr: [
    {
      id: string
      session_id: string
      created_at: string
      updated_at: string
      authentication_method: string
    }
  ]
  aal: string
}
