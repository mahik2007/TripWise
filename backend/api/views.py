import os
import sys
from decimal import Decimal
from collections import defaultdict

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import User, Group, GroupMember, Expense, Split, ContactMessage


def home(request):
    return JsonResponse({
        "status": "success",
        "message": "TripWise API is running smoothly",
        "version": "1.0.0"
    })


# ─── USER AUTHENTICATION ────────────────────────────────

@api_view(['POST'])
def signup(request):
    data = request.data
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return Response({"error": "Name, email, and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "An account with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    hashed_pw = make_password(password)
    user = User.objects.create(name=name, email=email, password=hashed_pw)
    return Response({
        "msg": "User created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    data = request.data
    login_id = data.get('email', data.get('username', '')).strip().lower()
    password = data.get('password', '')

    if not login_id or not password:
        return Response({"error": "Email/Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=login_id).first()
    if not user:
        user = User.objects.filter(name__iexact=login_id).first()

    if user and check_password(password, user.password):
        return Response({
            "msg": "Login success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        })

    return Response({"error": "Invalid credentials. Please check your details."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    new_password = request.data.get('new_password', '')

    if not email or not new_password:
        return Response({"error": "Email and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "No user found with this email"}, status=status.HTTP_404_NOT_FOUND)

    user.password = make_password(new_password)
    user.save()
    return Response({"msg": "Password reset successfully. Please login with your new password."})


# ─── GROUPS / TRIPS ──────────────────────────────────────

@api_view(['POST'])
def create_group(request):
    data = request.data
    name = data.get('name', 'My Trip').strip()
    destination = data.get('destination', '').strip()
    duration = data.get('duration', '').strip()
    budget = data.get('budget', '').strip()
    trip_type = data.get('trip_type', 'Friends Trip').strip()
    notes = data.get('notes', '').strip()
    user_id = data.get('created_by')
    member_names = data.get('members', [])

    user = User.objects.filter(id=user_id).first() if user_id else None

    group = Group.objects.create(
        name=name,
        destination=destination,
        duration=duration,
        budget=budget,
        trip_type=trip_type,
        notes=notes,
        created_by=user
    )

    created_members = []
    # If no member names provided, add at least the creator or generic members
    if not member_names:
        if user:
            member_names = [user.name]
        else:
            member_names = ["Member 1", "Member 2"]

    for m_name in member_names:
        m_name = str(m_name).strip()
        if m_name:
            gm = GroupMember.objects.create(group=group, name=m_name)
            created_members.append({"id": gm.id, "name": gm.name})

    return Response({
        "msg": "Group created successfully",
        "group": {
            "id": group.id,
            "name": group.name,
            "destination": group.destination,
            "budget": group.budget,
            "trip_type": group.trip_type,
            "members": created_members
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_group_details(request, group_id):
    group = Group.objects.filter(id=group_id).first()
    if not group:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    members = [{"id": m.id, "name": m.name} for m in group.members.all()]
    expenses_data = []
    total_amount = Decimal('0.00')

    for exp in group.expenses.all().order_by('-created_at'):
        total_amount += exp.amount
        splits = [{"member_name": s.member_name, "amount": float(s.amount)} for s in exp.splits.all()]
        expenses_data.append({
            "id": exp.id,
            "description": exp.description,
            "category": exp.category,
            "amount": float(exp.amount),
            "paid_by_name": exp.paid_by_name,
            "created_at": exp.created_at.strftime("%Y-%m-%d %H:%M"),
            "splits": splits
        })

    return Response({
        "id": group.id,
        "name": group.name,
        "destination": group.destination,
        "duration": group.duration,
        "budget": group.budget,
        "trip_type": group.trip_type,
        "notes": group.notes,
        "members": members,
        "expenses": expenses_data,
        "total_expense": float(total_amount),
        "per_person": float(total_amount / len(members)) if members else 0.0
    })


# ─── EXPENSES & BALANCES ────────────────────────────────

@api_view(['POST'])
def add_expense(request):
    data = request.data
    group_id = data.get('group_id')
    group = Group.objects.filter(id=group_id).first() if group_id else None

    # Fallback to the latest group if not provided
    if not group:
        group = Group.objects.last()
        if not group:
            group = Group.objects.create(name="Default Trip", destination="My Vacation")

    description = data.get('description', 'Expense').strip()
    category = data.get('category', 'Other')
    raw_amount = data.get('amount', data.get('total_amount', 0))

    try:
        amount = Decimal(str(raw_amount))
    except Exception:
        return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    paid_by_name = data.get('paid_by_name', '').strip()
    user_id = data.get('paid_by')
    user = User.objects.filter(id=user_id).first() if user_id else None

    group_members = list(group.members.all())
    if not paid_by_name:
        if user:
            paid_by_name = user.name
        elif group_members:
            paid_by_name = group_members[0].name
        else:
            paid_by_name = "Member 1"

    # Make sure payer is in group members
    existing_member_names = [m.name for m in group_members]
    if paid_by_name not in existing_member_names:
        gm = GroupMember.objects.create(group=group, name=paid_by_name)
        group_members.append(gm)
        existing_member_names.append(paid_by_name)

    expense = Expense.objects.create(
        group=group,
        description=description,
        category=category,
        amount=amount,
        paid_by=user,
        paid_by_name=paid_by_name
    )

    splits = data.get('splits', [])
    if not splits:
        # Default: equal split among all group members
        count = len(group_members)
        if count > 0:
            share = round(amount / count, 2)
            remainder = amount - (share * count)
            for i, gm in enumerate(group_members):
                mem_amount = share + (remainder if i == 0 else Decimal('0.00'))
                Split.objects.create(
                    expense=expense,
                    member_name=gm.name,
                    amount=mem_amount
                )
    else:
        for s in splits:
            s_name = s.get('member_name', s.get('name', ''))
            s_amount = Decimal(str(s.get('amount', 0)))
            Split.objects.create(
                expense=expense,
                member_name=s_name,
                amount=s_amount
            )

    return Response({
        "msg": "Expense added successfully",
        "expense_id": expense.id,
        "amount": float(expense.amount),
        "paid_by": paid_by_name
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def balances(request, group_id):
    group = Group.objects.filter(id=group_id).first()
    if not group:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    member_names = [m.name for m in group.members.all()]
    balances_map = {name: 0.0 for name in member_names}
    total_spent = 0.0

    expenses = Expense.objects.filter(group=group)
    for exp in expenses:
        exp_amount = float(exp.amount)
        total_spent += exp_amount
        payer = exp.paid_by_name
        if payer not in balances_map:
            balances_map[payer] = 0.0

        balances_map[payer] += exp_amount

        splits = Split.objects.filter(expense=exp)
        for s in splits:
            m_name = s.member_name
            if m_name not in balances_map:
                balances_map[m_name] = 0.0
            balances_map[m_name] -= float(s.amount)

    members_count = len(balances_map)
    per_person = (total_spent / members_count) if members_count > 0 else 0.0

    return Response({
        "group_id": group.id,
        "group_name": group.name,
        "total_expense": round(total_spent, 2),
        "members_count": members_count,
        "per_person": round(per_person, 2),
        "balances": {name: round(bal, 2) for name, bal in balances_map.items()}
    })


@api_view(['GET'])
def settle_up(request, group_id):
    group = Group.objects.filter(id=group_id).first()
    if not group:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    member_names = [m.name for m in group.members.all()]
    balances_map = defaultdict(float)
    for name in member_names:
        balances_map[name] = 0.0

    expenses = Expense.objects.filter(group=group)
    for exp in expenses:
        payer = exp.paid_by_name
        balances_map[payer] += float(exp.amount)
        splits = Split.objects.filter(expense=exp)
        for s in splits:
            balances_map[s.member_name] -= float(s.amount)

    creditors = []
    debtors = []

    for name, bal in balances_map.items():
        val = round(bal, 2)
        if val > 0.01:
            creditors.append([name, val])
        elif val < -0.01:
            debtors.append([name, -val])

    transactions = []
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor_name, d_amt = debtors[i]
        creditor_name, c_amt = creditors[j]

        settle_amt = round(min(d_amt, c_amt), 2)
        if settle_amt > 0.01:
            transactions.append({
                "from": debtor_name,
                "to": creditor_name,
                "amount": settle_amt
            })

        debtors[i][1] = round(debtors[i][1] - settle_amt, 2)
        creditors[j][1] = round(creditors[j][1] - settle_amt, 2)

        if debtors[i][1] <= 0.01:
            i += 1
        if creditors[j][1] <= 0.01:
            j += 1

    return Response({
        "group_id": group.id,
        "group_name": group.name,
        "transactions": transactions
    })


# ─── CONTACT & CHATBOT ──────────────────────────────────

@api_view(['POST'])
def contact(request):
    data = request.data
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return Response({"error": "Please provide name, email, and message."}, status=status.HTTP_400_BAD_REQUEST)

    ContactMessage.objects.create(name=name, email=email, message=message)
    return Response({"msg": "Thank you for reaching out! We have received your message and will respond soon."})


@api_view(['POST'])
def chatbot(request):
    user_message = request.data.get('message', '').strip()

    if not user_message:
        return Response({"reply": "Please ask me any travel budget or expense splitting question!"})

    chatbot_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', '..')
    )
    if chatbot_path not in sys.path:
        sys.path.insert(0, chatbot_path)

    try:
        from ai_chatbot.chatbot import get_ai_response
        reply = get_ai_response(user_message)
    except Exception as e:
        reply = f"Hello! How can I assist with your trip expenses today?"

    return Response({"reply": reply})