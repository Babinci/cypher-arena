from django.contrib import admin


from .models import UserFeedback
# Register your models here.
class UserFeedbackAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'feedback')

admin.site.register(UserFeedback, UserFeedbackAdmin)
# Register your models here.
