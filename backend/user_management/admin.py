from django.contrib import admin


from .models import UserFeedback, UserVisit
# Register your models here.
class UserVisitAdmin(admin.ModelAdmin):
    list_display = [
        'timestamp',
        'ip_address',
        'country',
        'region',
        'city',
        'device_type',
        'device_brand',
        'device_model',
        'os',
        'browser',
        'browser_version',
        'screen_resolution',
        'window_size',
        'path'
    ]
    
    list_filter = [
        'timestamp',
        'country',
        'region',
        'city',
        'device_type',
        'device_brand',
        'os',
        'browser',
        'path'
    ]


class UserFeedbackAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'feedback')

admin.site.register(UserVisit, UserVisitAdmin)
admin.site.register(UserFeedback, UserFeedbackAdmin)
# Register your models here.
