# import firebase_admin
# from firebase_admin import credentials, firestore
# # from datetime import datetime


# # def now_iso():
# #     return datetime.utcnow().isoformat()

# cred = credentials.Certificate("serviceAccountKey.json") 
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# accounts = [
#     {
#         "name": "Alice Nfor",
#         "location": "Buea",
#         "account_number": "ACCT-1001",
#         "payment_amount": 15000,
#         "due_date": "2025-11-20",
#         "status": "unpaid",
#         "linked_users": [
#             {"name": "Alice Nfor", "email": "alice@example.com", "phone": "+237650000001"}
#         ]
#     },
#     {
#         "name": "Emmanuel Fote",
#         "location": "Limbe",
#         "account_number": "ACCT-1002",
#         "payment_amount": 8000,
#         "due_date": "2025-11-22",
#         "status": "unpaid",
#         "linked_users": [
#             {"name": "Emmanuel Fote", "email": "emmanuel@example.com", "phone": "+237650000002"}
#         ]
#     },
#     {
#         "name": "Brenda Awung",
#         "location": "Yaounde",
#         "account_number": "ACCT-1003",
#         "payment_amount": 22000,
#         "due_date": "2025-11-19",
#         "status": "paid",
#         "linked_users": [
#             {"name": "Brenda Awung", "email": "brenda@example.com", "phone": "+237650000003"}
#         ]
#     },
#     {
#         "name": "Ngong Bertila",
#         "location": "Bamenda",
#         "account_number": "ACCT-1004",
#         "payment_amount": 12000,
#         "due_date": "2025-11-23",
#         "status": "unpaid",
#         "linked_users": [
#             {"name": "Ngong Bertila", "email": "bertila@example.com", "phone": "+237650000004"}
#         ]
#     }
# ]


# for acc in accounts:
#     # acc["created_at"] = now_iso()
#     # acc["updated_at"] = now_iso()
#     doc_ref = db.collection("accounts").document()
#     doc_ref.set(acc)
# #     print(f"✅ Uploaded account: {acc['account_number']}")

# # print("🎉 All accounts uploaded successfully!")
