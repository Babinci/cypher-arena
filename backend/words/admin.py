from django.contrib import admin
from .models import Word, ContrastPair, CypherArenaPerplexityDeepResearch

# Register your models here.
class WordsAdmin(admin.ModelAdmin):
    list_display = ('name', 'occurrence', 'speech_part')

class ContrastPairAdmin(admin.ModelAdmin):
    list_display = ('item1', 'item2', )


class CypherArenaPerplexityDeepResearchAdmin(admin.ModelAdmin):
    list_display = ('id', 'start_date', 'end_date', 'news_source')


admin.site.register(ContrastPair, ContrastPairAdmin)
admin.site.register(CypherArenaPerplexityDeepResearch, CypherArenaPerplexityDeepResearchAdmin)
admin.site.register(Word, WordsAdmin)
