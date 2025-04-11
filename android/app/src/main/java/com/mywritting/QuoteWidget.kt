package com.mywritting

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.app.PendingIntent
import android.widget.RemoteViews
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.URL

class QuoteWidget : AppWidgetProvider() {
    companion object {
        private const val REFRESH_ACTION = "com.mywritting.REFRESH_WIDGET"
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == REFRESH_ACTION) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(ComponentName(context, QuoteWidget::class.java))
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.quote_widget)

        // Set up refresh button click intent
        val refreshIntent = Intent(context, QuoteWidget::class.java).apply {
            action = REFRESH_ACTION
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            refreshIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)
        
        // Start with loading state
        views.setTextViewText(R.id.widget_quote_text, "Loading...")
        views.setTextViewText(R.id.widget_quote_id, "")
        
        // Update the widget immediately with loading state
        appWidgetManager.updateAppWidget(appWidgetId, views)

        // Fetch new quote in background
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://kkjwm3nu69.execute-api.us-east-1.amazonaws.com/dev/api/quotes?test=true")
                val response = url.readText()
                val json = JSONObject(response)
                
                val quoteText = json.getString("text")
                val quoteId = json.getInt("id")

                // Update widget with new quote
                views.setTextViewText(R.id.widget_quote_text, quoteText)
                views.setTextViewText(R.id.widget_quote_id, "Quote #$quoteId")
                
                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                views.setTextViewText(R.id.widget_quote_text, "Failed to load quote")
                appWidgetManager.updateAppWidget(appWidgetId, views)
            }
        }
    }
}