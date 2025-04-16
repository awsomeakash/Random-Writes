package com.mywritting

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.app.PendingIntent
import android.util.Log
import android.widget.RemoteViews
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.URL

class QuoteWidget : AppWidgetProvider() {
    companion object {
        private const val REFRESH_ACTION = "com.mywritting.REFRESH_WIDGET"
        private const val TAG = "QuoteWidget"
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        try {
            Log.d(TAG, "onUpdate called for ${appWidgetIds.size} widgets")
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onUpdate: ${e.message}")
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        try {
            super.onReceive(context, intent)
            Log.d(TAG, "onReceive called with action: ${intent.action}")
            if (intent.action == REFRESH_ACTION) {
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(ComponentName(context, QuoteWidget::class.java))
                onUpdate(context, appWidgetManager, appWidgetIds)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onReceive: ${e.message}")
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        try {
            Log.d(TAG, "Updating widget: $appWidgetId")
            
            // Create RemoteViews
            val views = RemoteViews(context.packageName, R.layout.quote_widget)
            
            try {
                // Set up refresh button click intent
                val refreshIntent = Intent(context, QuoteWidget::class.java).apply {
                    action = REFRESH_ACTION
                }
                val refreshPendingIntent = PendingIntent.getBroadcast(
                    context,
                    appWidgetId,
                    refreshIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)
                Log.d(TAG, "Refresh button intent set")
            } catch (e: Exception) {
                Log.e(TAG, "Error setting refresh intent: ${e.message}")
            }

            try {
                // Set up open app button click intent
                val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (openAppIntent != null) {
                    val openAppPendingIntent = PendingIntent.getActivity(
                        context,
                        appWidgetId + 1,
                        openAppIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(R.id.open_app_button, openAppPendingIntent)
                    Log.d(TAG, "Open app button intent set")
                } else {
                    Log.e(TAG, "Could not create open app intent")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error setting open app intent: ${e.message}")
            }
            
            // Start with loading state
            views.setTextViewText(R.id.widget_quote_text, "Loading...")
            
            // Update the widget immediately with loading state
            appWidgetManager.updateAppWidget(appWidgetId, views)
            Log.d(TAG, "Initial widget update completed")

            // Fetch new quote in background
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    Log.d(TAG, "Fetching quote from API")
                    val url = URL("https://kkjwm3nu69.execute-api.us-east-1.amazonaws.com/dev/api/quotes?test=true")
                    val response = url.readText()
                    val json = JSONObject(response)
                    
                    val quoteText = json.getString("text")
                    Log.d(TAG, "Successfully fetched quote: ${quoteText.take(20)}...")

                    // Update widget with new quote
                    views.setTextViewText(R.id.widget_quote_text, quoteText)
                    
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                    Log.d(TAG, "Widget updated with new quote")
                } catch (e: Exception) {
                    Log.e(TAG, "Error fetching quote: ${e.message}")
                    views.setTextViewText(R.id.widget_quote_text, "Unable to load quote")
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Fatal error in updateAppWidget: ${e.message}")
        }
    }
}