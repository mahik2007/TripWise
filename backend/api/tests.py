from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactMessage, Expense, Group, GroupMember, Split


class TripWiseApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_and_login(self):
        signup = self.client.post('/api/signup/', {
            'name': 'Asha Singh',
            'email': 'asha@example.com',
            'password': 'safe-test-password',
        }, format='json')
        self.assertEqual(signup.status_code, 201)
        self.assertEqual(signup.data['user']['email'], 'asha@example.com')

        login = self.client.post('/api/login/', {
            'email': 'asha@example.com',
            'password': 'safe-test-password',
        }, format='json')
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.data['user']['name'], 'Asha Singh')

    def test_expense_is_split_and_settled_correctly(self):
        group = Group.objects.create(name='Goa', destination='Goa')
        GroupMember.objects.create(group=group, name='Asha')
        GroupMember.objects.create(group=group, name='Ravi')

        add_expense = self.client.post('/api/add-expense/', {
            'group_id': group.id,
            'description': 'Hotel',
            'category': 'Stay',
            'amount': 1000,
            'paid_by_name': 'Asha',
        }, format='json')
        self.assertEqual(add_expense.status_code, 201)

        expense = Expense.objects.get(group=group)
        self.assertEqual(Split.objects.filter(expense=expense).count(), 2)
        self.assertEqual(sum(split.amount for split in expense.splits.all()), expense.amount)

        balances = self.client.get(f'/api/balances/{group.id}/')
        self.assertEqual(balances.status_code, 200)
        self.assertEqual(balances.data['balances'], {'Asha': 500.0, 'Ravi': -500.0})

        settlement = self.client.get(f'/api/settle/{group.id}/')
        self.assertEqual(settlement.status_code, 200)
        self.assertEqual(settlement.data['transactions'], [
            {'from': 'Ravi', 'to': 'Asha', 'amount': 500.0},
        ])

    def test_contact_and_chatbot_endpoints(self):
        contact = self.client.post('/api/contact/', {
            'name': 'Asha',
            'email': 'asha@example.com',
            'message': 'Please help with my trip.',
        }, format='json')
        self.assertEqual(contact.status_code, 200)
        self.assertEqual(ContactMessage.objects.count(), 1)

        chatbot = self.client.post('/api/chatbot/', {'message': 'How do I split an expense?'}, format='json')
        self.assertEqual(chatbot.status_code, 200)
        self.assertIn('TripWise', chatbot.data['reply'])

        calculation = self.client.post('/api/chatbot/', {'message': 'Split 1200 among 3 people'}, format='json')
        self.assertEqual(calculation.status_code, 200)
        self.assertIn('₹400.00 per person', calculation.data['reply'])
