from django.contrib import admin
from .models import Word, ContrastPair, CypherArenaPerplexityDeepResearch, ContrastPairRating

# Register your models here.
class WordsAdmin(admin.ModelAdmin):
    list_display = ('name', 'occurrence', 'speech_part')

class ContrastPairRatingFilter(admin.SimpleListFilter):
    title = 'Rating'
    parameter_name = 'rating'

    def lookups(self, request, model_admin):
        # Show all possible rating values (1-5)
        return [(str(i), str(i)) for i in range(1, 6)]

    def queryset(self, request, queryset):
        if self.value():
            # Filter ContrastPairs that have at least one rating with the selected value
            return queryset.filter(ratings__rating=self.value()).distinct()
        return queryset

class ContrastPairAdmin(admin.ModelAdmin):
    list_display = ('item1', 'item2', )
    list_filter = (ContrastPairRatingFilter,)


class CypherArenaPerplexityDeepResearchAdmin(admin.ModelAdmin):
    list_display = ('id', 'start_date', 'end_date', 'news_source')


admin.site.register(ContrastPair, ContrastPairAdmin)
admin.site.register(CypherArenaPerplexityDeepResearch, CypherArenaPerplexityDeepResearchAdmin)
admin.site.register(Word, WordsAdmin)
