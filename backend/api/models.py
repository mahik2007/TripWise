from django.db import models

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class Group(models.Model):
    name = models.CharField(max_length=150)
    destination = models.CharField(max_length=255, blank=True, default='')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    duration = models.CharField(max_length=100, blank=True, default='')
    budget = models.CharField(max_length=100, blank=True, default='')
    trip_type = models.CharField(max_length=100, blank=True, default='Friends Trip')
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    group = models.ForeignKey(Group, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, default='')

    def __str__(self):
        return f"{self.name} in {self.group.name}"


class Expense(models.Model):
    group = models.ForeignKey(Group, related_name='expenses', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default='General')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    paid_by_name = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - ₹{self.amount}"


class Split(models.Model):
    expense = models.ForeignKey(Expense, related_name='splits', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    member_name = models.CharField(max_length=100, blank=True, default='')
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.member_name or self.user} pays ₹{self.amount}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} ({self.email})"
