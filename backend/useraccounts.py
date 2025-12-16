# from datetime import datetime
from database import db


# def now_iso():
#     return datetime.utcnow().isoformat()

accounts = [
    
    {
        "name": "Bertila Ngong",
        "location": "Buea",
        "account_number": "ACCT-1008",
        "payment_amount": 25000,
        "due_date": "2025-11-22",
        "status": "pending",
        "linked_users": [
            {"name": "Bertila Ngong ", "email": "ngongberti@gmail.com", "phone": "+237678148820"}
        ]
    },
    
]


for acc in accounts:
    doc_ref = db.collection("accounts").document()
    doc_ref.set(acc)

# print("🎉 All accounts uploaded successfully!")
